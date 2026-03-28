import { useState, useEffect } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
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

  useEffect(() => {
    localStorage.setItem('noteflow_sort', sortBy)
  }, [sortBy])

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
