import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Pages serves files rather than a Node server. Emit an entry for each public
// route so direct visits and refreshes work without a redirect or hash router.
const destination = resolve('dist')
const template = await readFile(resolve(destination, 'index.html'), 'utf8')
const articles = JSON.parse(await readFile(new URL('../src/content/articles.json', import.meta.url), 'utf8'))
const routes = [
  ['topics', '生活主题', '从一件生活小事出发，按主题或关键词阅读古今文化对照。'],
  ['practices', '小行动', '选择适合自己的生活小行动，观察实际感受。'],
  ['saved', '阅读清单', '保存在当前浏览器的文章和小行动。'],
  ['about', '关于与来源', '了解原始材料、研究解释、编辑解读与实践建议的边界。'],
]
for (const article of articles.filter(article => article.status === 'published')) {
  if (!/^[a-z0-9-]+$/.test(article.id)) throw new Error(`Invalid article ID: ${article.id}`)
  routes.push([`articles/${article.id}`, article.title, article.description])
}
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
for (const [route, title, description] of routes) {
  const directory = resolve(destination, route)
  await mkdir(directory, { recursive: true })
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escape(title)} · 日常有来处</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, (_match, before, after) => `${before}${escape(description)}${after}`)
  await writeFile(resolve(directory, 'index.html'), html)
}
await writeFile(resolve(destination, '404.html'), template.replace(/<title>[\s\S]*?<\/title>/, '<title>这一页暂时找不到 · 日常有来处</title>'))
await writeFile(resolve(destination, '.nojekyll'), '')
console.log(`Created ${routes.length} static route entries, 404.html and .nojekyll.`)
