import { useNavigate, Link } from 'react-router-dom'
import { articles, categories } from '../content'
import { ArrowLink, ArticleCard, SearchBox } from '../components/Shared'
import { useEffect } from 'react'

export default function Home() {
  const navigate = useNavigate()
  useEffect(() => { document.title = '日常有来处 · 把今天的日子，放进更长的时间里看' }, [])
  return <>
    <section className="hero wrap" aria-labelledby="home-title">
      <div className="hero-copy">
        <h1 id="home-title">把今天的日子，<br />放进更长的时间里看。</h1>
        <p>从人情、吃饭、居住与忙闲出发，<br className="desktop-break" />读懂过去，也重新看见自己的生活。</p>
        <ArrowLink to="/topics" className="button button-red">从一件小事开始</ArrowLink>
      </div>
      <img className="hero-image" src="/images/hero.webp" alt="窗边的旧书、现代陶杯与枝叶，在一张日常书桌上相遇。生活意象插图。" width="1448" height="1086" fetchPriority="high" />
    </section>
    <section className="home-search wrap" aria-labelledby="search-title">
      <h2 id="search-title">最近，你在为哪件小事费心？</h2>
      <SearchBox onSearch={q => navigate(`/topics${q ? `?q=${encodeURIComponent(q)}` : ''}`)} />
      <div className="category-rail">{categories.map(c => <Link key={c.id} to={`/topics?category=${c.id}`}>{c.name}</Link>)}</div>
    </section>
    <section className="featured-section wrap" aria-labelledby="featured-title">
      <div className="section-heading"><h2 id="featured-title">从日常出发</h2><ArrowLink to="/topics">查看全部主题</ArrowLink></div>
      <div className="article-grid">{articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} featured />)}</div>
    </section>
    <section className="practice-band">
      <div className="wrap practice-band-inner"><div><span className="practice-kicker">今天试一试</span><h2>给生活留一点观察的余地。</h2><p>不必打卡，也不必证明一种方法有效。</p></div><ArrowLink to="/practices" className="button button-green">挑一个小行动</ArrowLink></div>
    </section>
  </>
}
