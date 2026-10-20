import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useLibrary } from '../lib/library'

const nav = [['/topics', '生活主题'], ['/practices', '小行动'], ['/saved', '阅读清单'], ['/about', '关于与来源']]
export function Brand({ small = false }: { small?: boolean }) {
  return <Link to="/" className={`brand ${small ? 'brand-small' : ''}`} aria-label="日常有来处 · 首页"><span className="seal" aria-hidden="true">日</span><span>日常有来处</span></Link>
}
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { notice, clearNotice, library } = useLibrary()
  useEffect(() => {
    setMenuOpen(false)
    if (location.hash) {
      const timer = window.setTimeout(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(), 50)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, location.hash])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(clearNotice, 5000)
    return () => window.clearTimeout(timer)
  }, [notice, clearNotice])
  useEffect(() => {
    if (!menuOpen) return
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])
  return <>
    <a className="skip-link" href="#main">跳到主要内容</a>
    <header className="site-header wrap">
      <Brand />
      <button className="mobile-menu icon-button" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="primary-nav" className={menuOpen ? 'open' : ''} aria-label="主导航">
        {nav.map(([path, text]) => <NavLink key={path} to={path}>{text}{path === '/saved' && library.saved.length > 0 && <span className="saved-count">{library.saved.length}</span>}</NavLink>)}
      </nav>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="site-footer wrap">
      <div className="footer-main"><Brand small /><span className="footer-promise">原文有出处，建议有边界。</span><Link to="/about">编辑原则 <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      <div className="footer-note"><span>从古代文本看日常 · 首期试读</span><span>插图为 AI 生成的生活意象，不作史料使用。</span></div>
    </footer>
    {notice && <div className="toast" role="status"><span>{notice.message}</span>{notice.action && <button onClick={notice.action}>{notice.actionLabel}</button>}<button className="icon-button" onClick={clearNotice} aria-label="关闭提示"><X size={17} /></button></div>}
  </>
}
