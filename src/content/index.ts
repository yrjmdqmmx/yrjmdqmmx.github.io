import rawArticles from './articles.json'

export const categories = [
  { id: 'relationships', name: '人与人', description: '在关系里，重新寻找自己的分寸。' },
  { id: 'time', name: '时间与自己', description: '忙与闲之间，也有自己的节律。' },
  { id: 'objects', name: '物与居所', description: '与物相处，也与自己的日常相处。' },
  { id: 'food', name: '吃饭这件事', description: '从一口真实的味道，认识生活。' },
  { id: 'festivals', name: '节日与共同生活', description: '一起度过的时刻，怎样留下记忆？' },
] as const

export type Article = (typeof rawArticles)[number]
export type Source = Article['sources'][number]
export const articles = rawArticles.filter(a => a.status === 'published')
export const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '生活主题'
export const getArticle = (id?: string) => articles.find(a => a.id === id)
export const readingMinutes = (article: Article) => Math.max(3, Math.ceil(
  (article.scene.join('').length + article.history.map(p => p.text).join('').length +
  article.borrow.length + article.adapt.length + article.avoid.length +
  article.practice.steps.join('').length + 250) / 300,
))
export function searchArticles(query: string, category: string) {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return articles.filter(a => (category === 'all' || a.category === category) &&
    tokens.every(token => [
      a.title, a.description, a.subtitle, categoryName(a.category),
      ...a.keywords, ...a.sources.map(s => s.title),
    ].join(' ').toLocaleLowerCase().includes(token)),
  )
}

export const sectionLabels = ['现代场景', '古代对应', '古今对照', '取舍与转化', '生活实践', '来源与延伸']
export const sectionIds = ['scene', 'history', 'comparison', 'adaptation', 'practice', 'sources']
