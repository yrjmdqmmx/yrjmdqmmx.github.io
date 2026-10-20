import { ArrowRight, Bookmark, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { categoryName, readingMinutes } from '../content'
import type { Article } from '../content'
import { useLibrary } from '../lib/library'

export function ArrowLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
  return <Link className={`arrow-link ${className}`} to={to}>{children}<ArrowRight size={19} strokeWidth={1.5} aria-hidden="true" /></Link>
}
export function SaveButton({ article, kind = 'article', compact = false }: { article: Article; kind?: 'article' | 'practice'; compact?: boolean }) {
  const { library, toggleSave } = useLibrary()
  const saved = library.saved.includes(`${kind}:${article.id}`)
  const name = kind === 'article' ? '文章' : '行动'
  return <button className={`save-button ${saved ? 'is-saved' : ''} ${compact ? 'compact' : ''}`} onClick={() => toggleSave(`${kind}:${article.id}`)} aria-pressed={saved} aria-label={`${saved ? '取消收藏' : '收藏'}${name}：${article.title}`}>
    <Bookmark size={19} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    {!compact && <span>{saved ? `已收藏${name}` : `收藏${name}`}</span>}
  </button>
}
export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return <article className={`article-card ${featured ? 'featured-card' : ''}`}>
    <Link to={`/articles/${article.id}`} className="article-image-link" tabIndex={-1} aria-hidden="true">
      <img src={`/images/${article.image}.webp`} alt="" loading="lazy" width="600" height="400" />
    </Link>
    <div className="card-meta"><span>{categoryName(article.category)}</span><span>约 {readingMinutes(article)} 分钟</span></div>
    <h3><Link to={`/articles/${article.id}`}>{article.title.split('，').map((part, i, parts) => <span key={i}>{part}{i < parts.length - 1 ? '，' : ''}</span>)}</Link></h3>
    <p>{article.description}</p>
    <div className="card-bottom"><ArrowLink to={`/articles/${article.id}`}>读这一篇</ArrowLink><SaveButton article={article} compact /></div>
  </article>
}
export function SearchBox({ initialValue = '', onSearch }: { initialValue?: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(initialValue)
  function submit(event: FormEvent) { event.preventDefault(); onSearch(value.trim()) }
  return <form role="search" className="search-form" onSubmit={submit}>
    <Search size={22} strokeWidth={1.5} aria-hidden="true" />
    <label className="sr-only" htmlFor="topic-search">搜索生活问题或典籍</label>
    <input id="topic-search" name="q" value={value} onChange={e => setValue(e.target.value)} placeholder="试试「随礼」「休息」「买东西」" autoComplete="off" maxLength={100} />
    {value && <button type="button" className="icon-button clear-search" aria-label="清空搜索" onClick={() => { setValue(''); onSearch('') }}><X size={18} /></button>}
    <button type="submit" className="search-submit" aria-label="提交搜索"><ArrowRight size={22} strokeWidth={1.5} /></button>
  </form>
}
export function PracticeCard({ article }: { article: Article }) {
  return <article className="practice-card">
    <div className="card-meta"><span>{categoryName(article.category)}</span><span>{article.practice.duration}</span></div>
    <h2>{article.practice.title}</h2>
    <p>{article.practice.condition}</p>
    <details><summary>看看具体怎么做</summary><ol>{article.practice.steps.map(step => <li key={step}>{step}</li>)}</ol><p><strong>结束后观察：</strong>{article.practice.observe}</p><p className="practice-stop"><strong>不必勉强：</strong>{article.practice.stop}</p></details>
    <div className="card-bottom"><ArrowLink to={`/articles/${article.id}#practice`}>带着背景，开始尝试</ArrowLink><SaveButton article={article} kind="practice" compact /></div>
  </article>
}
