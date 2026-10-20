import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, searchArticles } from '../content'
import { ArticleCard, SearchBox } from '../components/Shared'
import { SearchX } from 'lucide-react'

export default function Topics() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const rawCategory = params.get('category') || 'all'
  const category = categories.some(c => c.id === rawCategory) ? rawCategory : 'all'
  const results = searchArticles(query, category)
  useEffect(() => { document.title = '生活主题 · 日常有来处' }, [])
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    setParams(next)
  }
  return <div className="wrap listing-page">
    <header className="page-intro"><h1>从一件小事，<br />读懂一种生活。</h1><p>不急着寻找答案，先看看问题的来处。</p></header>
    <SearchBox key={query} initialValue={query} onSearch={q => update('q', q)} />
    <div className="filter-tabs" role="group" aria-label="按生活主题筛选">
      <button aria-pressed={category === 'all'} onClick={() => update('category', 'all')}>全部主题</button>
      {categories.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => update('category', c.id)}>{c.name}</button>)}
    </div>
    <div className="results-summary" role="status"><span>{query ? `与「${query}」有关的` : category !== 'all' ? categories.find(c => c.id === category)?.description : '从古代文本看日常'}{query ? ` ${results.length} 篇文章` : ''}</span><span>{!query && `${results.length} 篇试读`}</span></div>
    {results.length ? <div className="article-grid listing-grid">{results.map(a => <ArticleCard key={a.id} article={a} />)}</div>
      : <div className="empty-state"><SearchX size={34} strokeWidth={1} /><h2>还没有找到相关的文章。</h2><p>试试“随礼”“休息”“居住”，或换一个生活主题。<br />首期内容不多，我们愿意慢慢把每一篇写扎实。</p><button className="button button-outline" onClick={() => setParams({})}>查看全部文章</button></div>}
  </div>
}
