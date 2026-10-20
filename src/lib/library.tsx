import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { articles } from '../content'

type Library = { saved: string[]; notes: Record<string, string> }
type Notice = { message: string; action?: () => void; actionLabel?: string }
const KEY = 'richang-library-v1'
const allowedKeys = new Set(articles.flatMap(a => [`article:${a.id}`, `practice:${a.id}`]))
const ids = new Set(articles.map(a => a.id))
function readLibrary(): Library {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!value || typeof value !== 'object') return { saved: [], notes: {} }
    const data = value as Partial<Library>
    return {
      saved: Array.isArray(data.saved) ? [...new Set(data.saved.filter(k => typeof k === 'string' && allowedKeys.has(k)))] : [],
      notes: data.notes && typeof data.notes === 'object'
        ? Object.fromEntries(Object.entries(data.notes).filter(([k, v]) => ids.has(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 4000)]))
        : {},
    }
  } catch { return { saved: [], notes: {} } }
}
type LibraryContextValue = {
  library: Library
  toggleSave: (key: string) => void
  saveNote: (id: string, note: string) => boolean
  notice: Notice | null
  notify: (message: string, action?: () => void, actionLabel?: string) => void
  clearNotice: () => void
}
const LibraryContext = createContext<LibraryContextValue | null>(null)
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(readLibrary)
  const current = useRef(library)
  const [notice, setNotice] = useState<Notice | null>(null)
  const notify = useCallback((message: string, action?: () => void, actionLabel?: string) => setNotice({ message, action, actionLabel }), [])
  const clearNotice = useCallback(() => setNotice(null), [])
  const persist = (next: Library) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      current.current = next
      setLibrary(next)
      return true
    } catch {
      notify('当前浏览器无法保存数据。请复制需要保留的内容，稍后重试。')
      return false
    }
  }
  const toggleSave = (key: string) => {
    if (!allowedKeys.has(key)) return
    const exists = library.saved.includes(key)
    const next = { ...library, saved: exists ? library.saved.filter(k => k !== key) : [...library.saved, key] }
    if (persist(next)) {
      if (exists) notify('已从阅读清单移除。', () => {
        const latest = current.current
        if (persist({ ...latest, saved: [...new Set([...latest.saved, key])] })) notify('已恢复收藏。')
      }, '撤销')
      else notify('已保存到当前浏览器的阅读清单。')
    }
  }
  const saveNote = (id: string, note: string) => {
    if (!ids.has(id)) return false
    const notes = { ...library.notes }
    if (note.trim()) notes[id] = note.slice(0, 4000)
    else delete notes[id]
    const ok = persist({ ...library, notes })
    if (ok) notify(note.trim() ? '观察笔记已保存在当前浏览器。' : '这篇文章的观察笔记已清除。')
    return ok
  }
  return <LibraryContext.Provider value={{ library, toggleSave, saveNote, notice, notify, clearNotice }}>{children}</LibraryContext.Provider>
}
export function useLibrary() {
  const value = useContext(LibraryContext)
  if (!value) throw new Error('LibraryProvider is required')
  return value
}
