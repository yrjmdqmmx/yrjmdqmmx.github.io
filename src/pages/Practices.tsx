import { useEffect, useState } from 'react'
import { articles, categories } from '../content'
import { PracticeCard } from '../components/Shared'

export default function Practices() {
  const [category, setCategory] = useState('all')
  useEffect(() => { document.title = '小行动 · 日常有来处' }, [])
  const filtered = articles.filter(a => category === 'all' || a.category === category)
  return <div className="wrap listing-page">
    <header className="page-intro"><h1>给生活留一点<br />观察的余地。</h1><p>选择一件适合自己的小事。可以尝试，也可以不做。</p></header>
    <div className="practice-intro-note"><span>先读背景，再选行动。</span><p>这里的行动由本站提出，尚未经过效果验证。不必打卡，不必为了练习购买东西；无变化或不适合，也是一种观察。</p></div>
    <div className="filter-tabs" role="group" aria-label="按主题筛选小行动"><button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>全部行动</button>{categories.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div>
    <div className="practice-grid">{filtered.map(a => <PracticeCard key={a.id} article={a} />)}</div>
  </div>
}
