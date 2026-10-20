import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from '../server/app.mjs'

async function fixture(fn, options = {}) {
  const dataDir = await mkdtemp(join(tmpdir(), 'richang-test-'))
  const server = createApp({ dataDir, ...options }).listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}`
  const send = (body, headers = {}) => fetch(`${url}/api/feedback`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  try { await fn({ send, dataDir, url }) }
  finally {
    await new Promise(resolve => server.close(resolve))
    await rm(dataDir, { recursive: true, force: true })
  }
}
const valid = { articleId: 'gifts-and-boundaries', kind: 'reflection', outcome: 'unchanged', text: '没有变化也是一种观察。' }
test('feedback is acknowledged only after durable write, with no private client fields', () => fixture(async ({ send, dataDir }) => {
  const response = await send({ ...valid, privateNotes: 'do not store', name: 'do not store' })
  assert.equal(response.status, 201)
  const ack = await response.json()
  const record = JSON.parse((await readFile(join(dataDir, 'feedback.jsonl'), 'utf8')).trim())
  assert.equal(record.id, ack.id)
  assert.equal(record.text, valid.text)
  assert.equal(record.outcome, 'unchanged')
  assert.equal(record.privateNotes, undefined)
  assert.equal(record.name, undefined)
  assert.equal(record.ip, undefined)
}))
test('invalid article, outcome, oversized or insufficient correction are rejected', () => fixture(async ({ send }) => {
  for (const body of [
    { ...valid, articleId: '../../secret' }, { ...valid, outcome: 'fake' },
    { ...valid, text: '字'.repeat(1201) }, { ...valid, kind: 'correction', text: '短' },
  ]) assert.equal((await send(body)).status, 400)
}))
test('cross-origin submissions cannot write feedback', () => fixture(async ({ send }) => {
  assert.equal((await send(valid, { Origin: 'https://elsewhere.example' })).status, 403)
}))
test('corrections preserve a useful source explanation without an outcome', () => fixture(async ({ send, dataDir }) => {
  const response = await send({ articleId: valid.articleId, kind: 'correction', text: '请核对第二段的原文版本与标点。' })
  assert.equal(response.status, 201)
  const record = JSON.parse((await readFile(join(dataDir, 'feedback.jsonl'), 'utf8')).trim())
  assert.equal(record.kind, 'correction')
  assert.equal(record.outcome, undefined)
}))
test('failed storage does not report success', () => fixture(async ({ send }) => {
  assert.equal((await send(valid)).status, 503)
}, { dataDir: '/dev/null/feedback-not-a-directory' }))
test('repeated submissions are bounded', () => fixture(async ({ send }) => {
  assert.equal((await send(valid)).status, 201)
  const response = await send(valid)
  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '60')
}, { maxSubmissions: 1 }))
