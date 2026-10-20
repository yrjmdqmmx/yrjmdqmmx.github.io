import { useEffect } from 'react'
import { ArrowLink } from '../components/Shared'
import { isPagesSite, repositoryUrl } from '../lib/site'

export default function About() {
  useEffect(() => { document.title = '关于与来源 · 日常有来处' }, [])
  return <div className="wrap about-page">
    <header className="page-intro"><h1>原文有出处，<br />建议有边界。</h1><p>认真理解过去，也尊重今天生活的复杂。</p></header>
    <div className="about-layout"><aside><span className="seal">日</span><p>日常有来处<br /><small>从古代文本看日常</small></p></aside><div className="about-content">
      <section><h2>我们想做什么</h2><p>从一件具体的生活小事出发，读懂一份历史材料，比较古今条件，再由你决定：哪些值得借鉴，哪些应该留下。</p><p>传统文化中不必有现成的答案。理解一种不同的生活，也可能帮助我们更清楚地看见自己。</p></section>
      <section><h2>这四种内容，请分开理解</h2><dl className="evidence-list"><div><dt>原始材料</dt><dd>古籍原文、实物、生活记录等。规范性主张、文学表达和生活记录各有边界，“有出处”不等于“人人如此”。</dd></div><div><dt>研究解释</dt><dd>署明研究者与出处，说明它支持什么判断。有争议时，不把一种解释说成学界共识。</dd></div><div><dt>编辑解读</dt><dd>我们对材料的理解与古今比较。可以被质疑，也可能随着证据而修正。</dd></div><div><dt>实践建议</dt><dd>本站提出的现代尝试，尚未经过效果验证。允许无变化、不适合或增加负担。</dd></div></dl></section>
      <section><h2>关于首期试读</h2><p>现在的六篇文章主要使用男性士人的传世文字，因此本期明确称为“从古代文本看日常”。它们不能代表所有时代、地区和群体。</p><p>内容为 AI 辅助编写的编辑初稿，已提供可追溯的原文入口，尚未经专业学术复核。成书、注释和习俗的进一步考证仍需要完成。数字转录也可能存在错误，重要引文应与可靠版本核校。</p><p>我们不使用未经核实的古人名言，不把现实困难归因于修养不足，也不承诺小行动能解决工作、住房或家庭制度中的问题。</p></section>
      <section><h2>关于这些图片</h2><p>站内摄影风格图片均为 AI 生成的当代生活意象，用于帮助阅读和建立氛围，不是历史复原、文物照片或史料证据。图片中的书籍与器物不对应具体馆藏。</p></section>
      <section><h2>清单、笔记与反馈</h2><p>阅读清单与观察笔记只保存在当前浏览器，不会上传。更换设备、使用另一浏览器或清理网站数据后可能丢失；重要笔记请自行保留副本。</p>{isPagesSite ? <><p>内容建议通过 GitHub Issues 提交，需要 GitHub 账号，提交内容与账号名称会公开显示。本站不会把私人观察笔记附带发送，请不要在公开建议中填写私人信息。</p><p>本站未加入广告跟踪或访问统计脚本。网站由 GitHub Pages 托管，访问及公开反馈适用 GitHub 的隐私政策。</p></> : <><p>主动提交的匿名反馈会发送给网站，保存文章标识、反馈类型、填写内容和提交时间，不公开展示，也不要求姓名、邮箱或收入。私人观察笔记不会随反馈发送。</p><p>本站不设置广告跟踪或访问统计。为阻止短时重复提交，服务会在内存中短暂计数，不将 IP 地址写入反馈文件。</p></>}</section>
      <section><h2>发现错误时</h2>{isPagesSite ? <p>每篇文章末尾都有“在 GitHub 提出建议”，也可以访问<a href={`${repositoryUrl}/issues`} target="_blank" rel="noopener noreferrer" className="text-button">内容建议列表</a>。请写明具体段落和可核对的出处；提出建议不代表相关判断已经修正。</p> : <p>每篇文章末尾都有“指出内容问题”。请尽量写明具体段落和可核对的出处。提交成功代表反馈已收到，不代表相关判断已经修正。</p>}<p>重要修订应在对应文章记录修改日期、修改内容与依据；目前尚无发布后的内容更正记录。</p></section>
      <ArrowLink to="/topics" className="button button-red">带着一个问题，开始读</ArrowLink>
    </div></div>
  </div>
}
