import { useState, useEffect } from 'react'
import type { Note } from '../types/index'
import { loadNotes, saveNotes } from '../utils/storage'

export function useNotes() {
  const getInitialNotes = (): Note[] => {
    const savedNotes = loadNotes()
    if (savedNotes.length > 0) {
      return savedNotes
    }
    // 首次使用时的默认笔记
    return [
      {
        id: 1,
        title: '欢迎使用 NoteFlow',
        content: '这是你的第一条笔记。点击开始编辑...',
        updatedAt: '2026-03-28'
      },
      {
        id: 2,
        title: '快速开始指南',
        content: '1. 点击左侧笔记查看内容\n2. 使用搜索框查找笔记\n3. 点击"新建笔记"创建笔记',
        updatedAt: '2026-03-28'
      }
    ]
  }

  const [notes, setNotes] = useState<Note[]>(getInitialNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(() => {
    const initialNotes = getInitialNotes()
    return initialNotes.length > 0 ? initialNotes[0] : null
  })

  // 自动保存笔记到 LocalStorage
  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const createNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: '新建笔记',
      content: '',
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
  }

  const updateNote = (noteId: number, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : note
    )
    setNotes(updatedNotes)

    // 如果更新的是当前选中的笔记，同步更新 selectedNote
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, ...updates })
    }
  }

  const deleteNote = (noteId: number) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)

    // 如果删除的是当前选中的笔记，选择第一条笔记或设为 null
    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null)
    }
  }

  return {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote
  }
}
