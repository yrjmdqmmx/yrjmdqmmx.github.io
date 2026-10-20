import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { getArticle } from '../content'
import { isPagesSite, repositoryUrl } from '../lib/site'

const outcomes = [
  ['helpful', '有帮助'], ['unchanged', '没有变化'], ['unsuitable', '不适合我'],
  ['burden', '增加负担'], ['not-tried', '还没有尝试'],
]
export default function Feedback({ articleId }: { articleId: string }) {
  return isPagesSite ? <PublicFeedback articleId={articleId} /> : <LocalFeedback articleId={articleId} />
}

function PublicFeedback({ articleId }: { articleId: string }) {
  const article = getArticle(articleId)
  const params = new URLSearchParams({
    title: `内容建议：${article?.title ?? articleId}`,
    body: `文章：${article?.title ?? articleId}\n链接：https://yrjmdqmmx.github.io/articles/${articleId}/\n\n具体段落或问题：\n\n核对来源（如有）：\n\n建议：\n`,
  })
  return <section className="feedback-section" aria-labelledby="feedback-title">
    <h2 id="feedback-title">让内容在讨论中更准确。</h2>
    <p>发现疑问或出处问题，可以到 GitHub 提出建议。需要登录 GitHub，提交后会公开显示；请勿填写私人信息。</p>
    <a className="button button-green" href={`${repositoryUrl}/issues/new?${params}`} target="_blank" rel="noopener noreferrer">在 GitHub 提出建议<ArrowUpRight size={18} /></a>
    <p className="small-muted">自己的实践感受，也可以留在上方的私人观察笔记里。</p>
  </section>
}

function LocalFeedback({ articleId }: { articleId: string }) {
  const [kind, setKind] = useState('reflection')
  const [outcome, setOutcome] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (kind === 'reflection' && !outcome) { setError('请先选择一种感受。'); setStatus('error'); return }
    if (kind === 'correction' && text.trim().length < 8) { setError('请至少写 8 个字，说明具体段落或出处问题。'); setStatus('error'); return }
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, kind, outcome, text }),
        signal: AbortSignal.timeout(15000),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || '暂时无法提交，请稍后重试。')
      setStatus('success')
      setText('')
    } catch (error) {
      setStatus('error')
      setError(error instanceof Error && !['TypeError', 'TimeoutError'].includes(error.name)
        ? error.message : '连接暂时不可用，反馈尚未送达。文字仍在，可以稍后重试。')
    }
  }
  return <section className="feedback-section" aria-labelledby="feedback-title">
    <h2 id="feedback-title">也听听你的观察。</h2>
    <p>没有变化或不适合，都值得被认真对待。</p>
    {status === 'success' ? <div className="feedback-success" role="status"><Check size={25} /><div><h3>反馈已收到，谢谢你的认真。</h3><p>它不会公开显示；纠错建议会在复核后处理。</p><button className="text-button" onClick={() => { setStatus('idle'); setOutcome('') }}>再补充一点</button></div></div> :
      <form onSubmit={submit}>
        <div className="feedback-tabs" role="group" aria-label="反馈类型">
          <button type="button" aria-pressed={kind === 'reflection'} disabled={status === 'sending'} onClick={() => { setKind('reflection'); setError('') }}>实践感受</button>
          <button type="button" aria-pressed={kind === 'correction'} disabled={status === 'sending'} onClick={() => { setKind('correction'); setError('') }}>指出内容问题</button>
        </div>
        {kind === 'reflection' && <fieldset><legend className="sr-only">这项行动给你的感受</legend><div className="outcome-options">{outcomes.map(([value, label]) => <label className={outcome === value ? 'selected' : ''} key={value}><input type="radio" name="outcome" value={value} checked={outcome === value} disabled={status === 'sending'} onChange={() => setOutcome(value)} />{label}</label>)}</div></fieldset>}
        <label className="field-label" htmlFor="feedback-text">{kind === 'reflection' ? '想补充的话（可选）' : '具体是哪一处？也可以附上核对来源。'}</label>
        <textarea id="feedback-text" value={text} maxLength={1200} minLength={kind === 'correction' ? 8 : undefined} required={kind === 'correction'} onChange={e => setText(e.target.value)} disabled={status === 'sending'} rows={3} placeholder={kind === 'reflection' ? '只写你愿意分享的部分。' : '请写明段落、问题，以及你找到的出处。'} aria-describedby="feedback-privacy" />
        <div className="feedback-form-footer"><p id="feedback-privacy">匿名提交后会发送给网站，不会公开。请勿填写姓名、收入或他人的私人信息。</p><span>{text.length}/1200</span></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-green" type="submit" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle className="spinner" size={18} />正在提交</> : <>提交反馈<ArrowRight size={18} /></>}</button>
      </form>}
  </section>
}
