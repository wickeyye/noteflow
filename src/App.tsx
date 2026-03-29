import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
import { useKeyboard } from './hooks/useKeyboard'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import type { CollapsedSections } from './types/index'

type SortOption = 'time' | 'title'

function App() {
  const {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite
  } = useNotes()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('noteflow_sort')
    return (saved as SortOption) || 'time'
  })
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(() => {
    const saved = localStorage.getItem('noteflow_collapsed_sections')
    return saved ? JSON.parse(saved) : { recent: false, favorite: false, all: false }
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('noteflow_sort', sortBy)
  }, [sortBy])

  useEffect(() => {
    localStorage.setItem('noteflow_collapsed_sections', JSON.stringify(collapsedSections))
  }, [collapsedSections])

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

  const handleToggleSection = (section: keyof CollapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        sortBy={sortBy}
        collapsedSections={collapsedSections}
        searchInputRef={searchInputRef}
        onSearchChange={setSearchQuery}
        onTagSelect={setSelectedTag}
        onSortChange={setSortBy}
        onNoteSelect={setSelectedNote}
        onNoteCreate={createNote}
        onNoteDelete={handleDeleteNote}
        onToggleFavorite={toggleFavorite}
        onToggleSection={handleToggleSection}
      />
      <Editor
        note={selectedNote}
        notesCount={notes.length}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onTagsChange={handleTagsChange}
      />
    </div>
  )
}

export default App
