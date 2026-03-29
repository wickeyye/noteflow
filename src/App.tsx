import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
import { useKeyboard } from './hooks/useKeyboard'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Auth } from './components/Auth'
import { importMarkdownFile, importZipFile, validateFileType } from './utils/import'
import { supabase } from './lib/supabase'
import { syncNotes } from './lib/sync'
import { testSync } from './utils/testSync'
import { monitorSync, stopMonitor, checkSync } from './utils/syncMonitor'
import { diagnoseSync } from './utils/diagnose'
import type { User } from '@supabase/supabase-js'

// 暴露测试和监控函数到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).testSync = testSync
  (window as any).monitorSync = monitorSync
  (window as any).stopMonitor = stopMonitor
  (window as any).checkSync = checkSync
  (window as any).diagnoseSync = diagnoseSync
}

type SortOption = 'time' | 'title'

function App() {
  const {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    setNotes
  } = useNotes()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('noteflow_sort')
    return (saved as SortOption) || 'time'
  })
  const [activeTab, setActiveTab] = useState<'favorite' | 'all'>(() => {
    const saved = localStorage.getItem('noteflow_active_tab')
    return (saved as 'favorite' | 'all') || 'all'
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 检查用户登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 用户登录后同步数据
  useEffect(() => {
    if (user) {
      syncNotes(notes, user.id).then(syncedNotes => {
        setNotes(syncedNotes)
      }).catch(error => {
        console.error('同步失败:', error)
      })
    }
  }, [user])

  // 定时同步（每30秒）
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      syncNotes(notes, user.id).then(syncedNotes => {
        setNotes(syncedNotes)
      }).catch(error => {
        console.error('自动同步失败:', error)
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [user, notes])

  useEffect(() => {
    localStorage.setItem('noteflow_sort', sortBy)
  }, [sortBy])

  useEffect(() => {
    localStorage.setItem('noteflow_active_tab', activeTab)
  }, [activeTab])

  // 快捷键支持
  useKeyboard({
    onNew: createNote,
    onSave: () => {
      alert('✅ 笔记已自动保存')
    },
    onSearch: () => {
      searchInputRef.current?.focus()
    },
    onDelete: () => {
      if (selectedNote) {
        const event = new MouseEvent('click', { bubbles: true })
        handleDeleteNote(selectedNote.id, event as any)
      }
    }
  })

  const handleDeleteNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()

    const noteToDelete = notes.find(note => note.id === noteId)
    if (!noteToDelete) return

    if (!confirm(`确定要删除笔记"${noteToDelete.title}"吗？`)) {
      return
    }

    deleteNote(noteId)
  }

  const handleTitleChange = (title: string) => {
    if (!selectedNote) return
    updateNote(selectedNote.id, { title })
  }

  const handleContentChange = (content: string) => {
    if (!selectedNote) return
    updateNote(selectedNote.id, { content })
  }

  const handleTagsChange = (tags: string[]) => {
    if (!selectedNote) return
    updateNote(selectedNote.id, { tags })
  }


  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (!validateFileType(file)) {
      alert('仅支持 .md 和 .zip 文件')
      event.target.value = ''
      return
    }

    try {
      if (file.name.endsWith('.zip')) {
        const importedNotes = await importZipFile(file)
        if (importedNotes.length === 0) {
          alert('ZIP 中没有找到 Markdown 文件')
          return
        }

        let firstNoteId: number | null = null
        importedNotes.forEach((noteData, index) => {
          const newNote = createNote()
          if (index === 0) firstNoteId = newNote.id
          updateNote(newNote.id, {
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags
          })
        })

        if (firstNoteId) {
          const firstNote = notes.find(n => n.id === firstNoteId)
          if (firstNote) setSelectedNote(firstNote)
        }

        alert(`成功导入 ${importedNotes.length} 条笔记`)
      } else if (file.name.endsWith('.md')) {
        const noteData = await importMarkdownFile(file)
        const newNote = createNote()
        updateNote(newNote.id, {
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags
        })
        setSelectedNote(newNote)
        alert(`已导入笔记：${noteData.title}`)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('导入失败，请检查文件格式')
    }

    event.target.value = ''
  }

  const handleAuthSuccess = () => {
    setGuestMode(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">加载中...</div>
      </div>
    )
  }

  if (!user && !guestMode) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        sortBy={sortBy}
        activeTab={activeTab}
        userEmail={user?.email}
        searchInputRef={searchInputRef}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onNoteSelect={setSelectedNote}
        onNoteCreate={createNote}
        onNoteDelete={handleDeleteNote}
        onToggleFavorite={toggleFavorite}
        onTabChange={setActiveTab}
      />
      <Editor
        note={selectedNote}
        notesCount={notes.length}
        allNotes={notes}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onTagsChange={handleTagsChange}
        onImport={handleImport}
      />
    </div>
  )
}

export default App
