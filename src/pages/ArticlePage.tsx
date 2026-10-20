import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Share2, Copy, Check } from 'lucide-react'
import { articles, categoryName, getArticle, readingMinutes, sectionIds, sectionLabels } from '../content'
import type { Article } from '../content'
import { ArticleCard, SaveButton } from '../components/Shared'
import { useLibrary } from '../lib/library'
import Feedback from '../components/Feedback'
import NotFound from './NotFound'

function TableOfContents({ active }: { active: string }) {
  return <nav aria-label="本篇目录"><h2>本篇目录</h2><ol>{sectionLabels.map((label, i) => <li key={label}><a href={`#${sectionIds[i]}`} aria-current={active === sectionIds[i] ? 'location' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{label}</a></li>)}</ol></nav>
}
function SectionHeading({ number, children }: { number: number; children: React.ReactNode }) {
  return <h2><span className="section-number">{String(number).padStart(2, '0')}</span>{children}</h2>
}
function ObservationNote({ article }: { article: Article }) {
  const { library, saveNote } = useLibrary()
  const [note, setNote] = useState(library.notes[article.id] || '')
  const saved = note === (library.notes[article.id] || '')
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => { if (!saved) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [saved])
  return <details className="observation-note">
    <summary>留一句自己的观察<span>仅存当前浏览器</span></summary>
    <label className="field-label" htmlFor="private-note">这次留意到了什么？</label>
    <textarea id="private-note" rows={4} maxLength={4000} value={note} onChange={e => setNote(e.target.value)} placeholder="可以是一个发现，也可以是“今天不适合”。" />
    <p className="small-muted">笔记不会随匿名反馈发送。写完请保存；清理浏览器数据可能丢失。</p>
    <div className="note-actions"><button className="button button-outline" disabled={saved} onClick={() => { if (saveNote(article.id, note) && !note.trim()) setNote('') }}>{saved && note ? <><Check size={16} />已保存</> : '保存观察'}</button><span role="status">{saved ? (note ? '已保存到本机' : '') : '尚未保存'}</span>{note && <button className="text-button" onClick={() => { if (saveNote(article.id, '')) setNote('') }}>清除这条笔记</button>}</div>
  </details>
}
function ReadingPage({ article }: { article: Article }) {
  const [active, setActive] = useState('scene')
  const [shareUrl, setShareUrl] = useState('')
  const { notify } = useLibrary()
  useEffect(() => {
    document.title = `${article.title} · 日常有来处`
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) setActive(visible[0].target.id)
    }, { rootMargin: '-8% 0px -65% 0px', threshold: 0 })
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [article])
  async function share() {
    const url = `${window.location.origin}/articles/${article.id}`
    try {
      await navigator.clipboard.writeText(url)
      notify('文章链接已复制。')
    } catch { setShareUrl(url) }
  }
  const source = article.sources.find(s => s.id === article.quote.sourceId)
  const related = articles.filter(a => a.id !== article.id).sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category)).slice(0, 2)
  return <>
    <div className="reading-layout wrap">
      <article className="reading-content">
        <Link className="back-link" to="/topics"><ArrowLeft size={17} />返回生活主题</Link>
        <header className="article-header">
          <h1>{article.title.split('，').map((part, i, parts) => <span key={i}>{part}{i < parts.length - 1 ? '，' : ''}</span>)}</h1>
          <div className="article-meta"><Link to={`/topics?category=${article.category}`}>{categoryName(article.category)}</Link><span>{article.kind}</span><span>约 {readingMinutes(article)} 分钟</span></div>
          <p className="article-deck">{article.subtitle}</p>
          <p className="review-status">编辑试读稿 · 待专业学术复核</p>
          <details className="context-note"><summary>读前了解：这份材料来自哪里？</summary><dl><div><dt>时代</dt><dd>{article.era}</dd></div><div><dt>地域</dt><dd>{article.region}</dd></div><div><dt>对象</dt><dd>{article.group}</dd></div></dl><p>当代开场为虚构情境。本文是编辑试读稿，尚未经专业学术复核；历史文本、本站解读和实践建议请分别理解。</p></details>
          <div className="mobile-article-tools"><SaveButton article={article} /><button className="text-icon-button" onClick={share}><Share2 size={18} />分享</button></div>
          {shareUrl && <div className="share-fallback" role="status"><label htmlFor="share-url"><Copy size={17} />请复制文章链接</label><input id="share-url" autoFocus readOnly value={shareUrl} onFocus={e => e.target.select()} /><button className="text-button" onClick={() => setShareUrl('')}>收起</button></div>}
        </header>
        <details className="mobile-toc"><summary>本篇目录</summary><TableOfContents active={active} /></details>
        <section id="scene" className="reading-section"><SectionHeading number={1}>{article.sceneTitle}</SectionHeading>{article.scene.map(p => <p key={p}>{p}</p>)}</section>
        <section id="history" className="reading-section"><SectionHeading number={2}>{article.historyTitle}</SectionHeading>
          <blockquote><p>{article.quote.text}</p>{source && <cite><a href={`#source-${source.id}`}>{source.title}</a></cite>}</blockquote>
          {article.history.map((p, i) => <p key={i}>{p.text}{p.sourceIds.map(id => { const s = article.sources.find(x => x.id === id); return <a className="source-ref" href={`#source-${id}`} key={id} aria-label={`核对出处：${s?.title}`}>〔{article.sources.findIndex(x => x.id === id) + 1}〕</a> })}</p>)}
          <p className="reading-aside-note">以上白话说明含本站解读。原文记载或提出的主张，不自动等于当时所有人的生活实况。</p>
        </section>
        <section id="comparison" className="reading-section"><SectionHeading number={3}>放在一起看，也看见不同。</SectionHeading>
          <div className="comparison-table" role="table" aria-label="古今对照">
            <div className="comparison-head" role="row"><span role="columnheader">比较维度</span><span role="columnheader">这份古代材料</span><span role="columnheader">今天重新讨论</span></div>
            {article.comparison.map(row => <div className="comparison-row" role="row" key={row[0]}><strong role="rowheader">{row[0]}</strong><span role="cell"><small>这份古代材料</small>{row[1]}</span><span role="cell"><small>今天重新讨论</small>{row[2]}</span></div>)}
          </div><p className="small-muted">“今天重新讨论”是本站提出的思考方向，不是古人原话，也不代表所有现代人的实际处境。</p>
        </section>
        <section id="adaptation" className="reading-section"><SectionHeading number={4}>哪些带走，哪些留下？</SectionHeading>
          <div className="takeaway"><h3>可以借鉴</h3><p>{article.borrow}</p></div><div className="takeaway"><h3>需要调整</h3><p>{article.adapt}</p></div><div className="takeaway"><h3>不宜沿用</h3><p>{article.avoid}</p></div><p>{article.limit}</p>
        </section>
        <section id="practice" className="reading-section"><SectionHeading number={5}>今天，可以试一试。</SectionHeading>
          <div className="article-practice"><div className="practice-top"><span>本站提出的小行动</span><span>{article.practice.duration}</span></div><h3>{article.practice.title}</h3><p>{article.practice.condition}</p><ol>{article.practice.steps.map(step => <li key={step}>{step}</li>)}</ol>
            {article.practice.example && <div className="speech-example"><span>一种表达示例</span><p>{article.practice.example}</p><small>本站拟写，不是古语，也不是保证有效的话术。</small></div>}
            <h4>结束后，观察什么？</h4><p>{article.practice.observe}</p><h4>什么时候不必勉强？</h4><p>{article.practice.stop}</p><SaveButton article={article} kind="practice" /></div>
          <ObservationNote article={article} />
        </section>
        <section id="sources" className="reading-section sources-section"><SectionHeading number={6}>来源与延伸</SectionHeading><p>让引用回到上下文，也给不同理解留下位置。</p>
          <ol className="sources-list">{article.sources.map((s, i) => <li key={s.id} id={`source-${s.id}`}><span className="source-kind">{s.type} · {String(i + 1).padStart(2, '0')}</span><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<ArrowUpRight size={17} /></a></h3><p>{s.locator}</p><p>{s.note}</p></li>)}</ol>
          <div className="editor-note"><p><strong>建议归属：</strong>本篇取舍与行动均为本站编辑建议，尚未经过效果验证。可以尝试，也可以不采用。</p><p>编写：本站内容初稿（AI 辅助） · 专业学术复核：待完成<br />初稿日期：{article.updatedAt} · 尚无发布后的内容更正记录</p><Link to="/about">了解编辑原则与资料边界<ArrowUpRight size={15} /></Link></div>
        </section>
        <Feedback key={article.id} articleId={article.id} />
      </article>
      <aside className="reading-sidebar"><div className="sticky-sidebar"><TableOfContents active={active} /><div className="sidebar-actions"><SaveButton article={article} /><button className="text-icon-button" onClick={share}><Share2 size={18} strokeWidth={1.5} />分享</button></div></div></aside>
    </div>
    <section className="related-section wrap"><div className="section-heading"><h2>换个角度，接着读。</h2></div><div className="related-grid">{related.map(a => <ArticleCard article={a} key={a.id} />)}</div></section>
  </>
}
export default function ArticlePage() {
  const { id } = useParams()
  const article = getArticle(id)
  return article ? <ReadingPage article={article} key={article.id} /> : <NotFound />
}
