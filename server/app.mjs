import express from 'express'
import { readFile, mkdir, appendFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'

const content = JSON.parse(await readFile(new URL('../src/content/articles.json', import.meta.url), 'utf8'))
const articleIds = new Set(content.filter(a => a.status === 'published').map(a => a.id))
const outcomes = new Set(['helpful', 'unchanged', 'unsuitable', 'burden', 'not-tried'])

export function createApp({ dataDir = resolve('data'), maxSubmissions = 15 } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    const origin = req.get('origin')
    if (origin) {
      try {
        if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: '请从本站页面提交反馈。' })
      } catch {
        return res.status(403).json({ error: '请求来源无效。' })
      }
    }
    next()
  })
  app.use('/api', express.json({ limit: '8kb', strict: true }))
  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  // Bounded in-memory rate limit. IP addresses are not written to disk.
  const recent = new Map()
  app.post('/api/feedback', async (req, res) => {
    if (!req.is('application/json')) return res.status(415).json({ error: '请以正确格式提交反馈。' })
    const { articleId, kind, outcome, text = '' } = req.body ?? {}
    if (!articleIds.has(articleId) || !['reflection', 'correction'].includes(kind) ||
      typeof text !== 'string' || text.length > 1200 ||
      (kind === 'reflection' && !outcomes.has(outcome)) ||
      (kind === 'correction' && text.trim().length < 8)) {
      return res.status(400).json({ error: '请检查反馈选项；纠错说明至少填写 8 个字，最多 1200 字。' })
    }
    const now = Date.now()
    for (const [key, entry] of recent) if (now - entry.start > 60000) recent.delete(key)
    const key = req.ip ?? 'local'
    const entry = recent.get(key) ?? { start: now, count: 0 }
    if (entry.count >= maxSubmissions || recent.size > 10000) {
      res.set('Retry-After', '60')
      return res.status(429).json({ error: '提交有些频繁，请一分钟后再试。' })
    }
    entry.count++
    recent.set(key, entry)
    const record = {
      id: randomUUID(), articleId, kind,
      ...(kind === 'reflection' ? { outcome } : {}),
      text: text.trim(), createdAt: new Date().toISOString(),
    }
    try {
      await mkdir(dataDir, { recursive: true, mode: 0o700 })
      await appendFile(resolve(dataDir, 'feedback.jsonl'), JSON.stringify(record) + '\n', { encoding: 'utf8', mode: 0o600 })
      return res.status(201).json({ ok: true, id: record.id })
    } catch {
      return res.status(503).json({ error: '暂时无法保存反馈。文字仍在，请稍后重试。' })
    }
  })
  app.use('/api', (_req, res) => res.status(404).json({ error: '没有找到这个接口。' }))
  app.use((err, _req, res, next) => {
    if (!err) return next()
    return res.status(err.type === 'entity.too.large' ? 413 : 400).json({ error: '提交内容过大或格式有误。' })
  })
  return app
}
