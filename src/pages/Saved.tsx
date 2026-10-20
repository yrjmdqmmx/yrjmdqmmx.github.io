import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { articles } from '../content'
import { ArrowLink, ArticleCard, PracticeCard } from '../components/Shared'
import { useLibrary } from '../lib/library'

export default function Saved() {
  const [tab, setTab] = useState('article')
  const { library } = useLibrary()
  useEffect(() => { document.title = '阅读清单 · 日常有来处' }, [])
  const saved = articles.filter(a => library.saved.includes(`${tab}:${a.id}`))
  return <div className="wrap listing-page">
    <header className="page-intro"><h1>留给下次，<br />也留给自己。</h1><p>值得再读的文字，想慢慢尝试的小事。</p></header>
    <p className="storage-note">清单和观察笔记仅保存在当前浏览器，不会上传。更换设备或清理浏览器数据后可能丢失。</p>
    <div className="filter-tabs" role="group" aria-label="收藏类型">
      <button aria-pressed={tab === 'article'} onClick={() => setTab('article')}>文章 · {library.saved.filter(s => s.startsWith('article:')).length}</button>
      <button aria-pressed={tab === 'practice'} onClick={() => setTab('practice')}>小行动 · {library.saved.filter(s => s.startsWith('practice:')).length}</button>
    </div>
    {saved.length ? <div className={`saved-results ${tab === 'article' ? 'article-grid listing-grid' : 'practice-grid'}`}>{saved.map(a => tab === 'article' ? <ArticleCard article={a} key={a.id} /> : <PracticeCard key={a.id} article={a} />)}</div>
      : <div className="empty-state"><Bookmark size={34} strokeWidth={1} /><h2>这里还留着空白。</h2><p>遇到想再看的{tab === 'article' ? '文章' : '小行动'}，点一下收藏，<br />就能在这里找回来。</p><ArrowLink to={tab === 'article' ? '/topics' : '/practices'} className="button button-red">{tab === 'article' ? '去读一篇文章' : '挑一个小行动'}</ArrowLink></div>}
  </div>
}
