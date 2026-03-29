import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
import { useKeyboard } from './hooks/useKeyboard'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { importMarkdownFile, importZipFile, validateFileType } from './utils/import'
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
        onImport={handleImport}
      />
    </div>
  )
}

export default App
