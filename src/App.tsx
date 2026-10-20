import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { LibraryProvider } from './lib/library'
import Home from './pages/Home'
import Topics from './pages/Topics'
import ArticlePage from './pages/ArticlePage'
import Practices from './pages/Practices'
import Saved from './pages/Saved'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  return <LibraryProvider><BrowserRouter><Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="topics" element={<Topics />} />
    <Route path="articles/:id" element={<ArticlePage />} />
    <Route path="practices" element={<Practices />} />
    <Route path="saved" element={<Saved />} />
    <Route path="about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter></LibraryProvider>
}
