import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
import { useKeyboard } from './hooks/useKeyboard'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'

type SortOption = 'time' | 'title'

function App() {
  const {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote
  } = useNotes()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('noteflow_sort')
    return (saved as SortOption) || 'time'
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('noteflow_sort', sortBy)
  }, [sortBy])

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

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        sortBy={sortBy}
        searchInputRef={searchInputRef}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onNoteSelect={setSelectedNote}
        onNoteCreate={createNote}
        onNoteDelete={handleDeleteNote}
      />
      <Editor
        note={selectedNote}
        notesCount={notes.length}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
      />
    </div>
  )
}

export default App
