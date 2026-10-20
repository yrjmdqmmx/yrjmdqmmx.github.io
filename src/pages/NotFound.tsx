import { useEffect } from 'react'
import { ArrowLink } from '../components/Shared'
export default function NotFound() {
  useEffect(() => { document.title = '这一页暂时找不到 · 日常有来处' }, [])
  return <div className="wrap empty-state not-found"><span className="not-found-number">404</span><h1>这一页，暂时没有找到。</h1><p>链接可能有误，或内容已经调整。<br />从一件熟悉的生活小事重新开始吧。</p><ArrowLink to="/topics" className="button button-red">回到生活主题</ArrowLink></div>
}
