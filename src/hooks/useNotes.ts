import { useState, useEffect } from 'react'
import type { Note } from '../types/index'
import { loadNotes, saveNotes, addDeletedCloudId } from '../utils/storage'

export function useNotes(userId?: string) {
  const getInitialNotes = (): Note[] => {
    const savedNotes = loadNotes(userId)
    if (savedNotes.length > 0) {
      return savedNotes
    }
    // 首次使用时的默认笔记
    const now = Date.now()
    return [
      {
        id: 1,
        cloudId: crypto.randomUUID(),
        title: '欢迎使用 NoteFlow',
        content: '这是你的第一条笔记。点击开始编辑...',
        updatedAt: '2026-03-28',
        localUpdatedAt: now,
        tags: []
      },
      {
        id: 2,
        cloudId: crypto.randomUUID(),
        title: '快速开始指南',
        content: '1. 点击左侧笔记查看内容\n2. 使用搜索框查找笔记\n3. 点击"新建笔记"创建笔记',
        updatedAt: '2026-03-28',
        localUpdatedAt: now,
        tags: []
      }
    ]
  }

  const [notes, setNotes] = useState<Note[]>(getInitialNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(() => {
    const initialNotes = getInitialNotes()
    return initialNotes.length > 0 ? initialNotes[0] : null
  })

  // 当 userId 变化时，重新加载笔记
  useEffect(() => {
    const loadedNotes = loadNotes(userId)
    if (loadedNotes.length > 0) {
      setNotes(loadedNotes)
      setSelectedNote(loadedNotes[0])
    } else {
      // 如果没有笔记，使用默认笔记
      const defaultNotes = getInitialNotes()
      setNotes(defaultNotes)
      setSelectedNote(defaultNotes[0])
    }
  }, [userId])

  // 自动保存笔记到 LocalStorage（按用户隔离）
  useEffect(() => {
    saveNotes(notes, userId)
  }, [notes, userId])

  const createNote = (): Note => {
    const now = Date.now()
    const newNote: Note = {
      id: now,
      cloudId: crypto.randomUUID(), // 生成云端唯一标识
      title: '新建笔记',
      content: '',
      updatedAt: new Date().toISOString().split('T')[0],
      localUpdatedAt: now, // 毫秒时间戳
      tags: [],
      isFavorite: false
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    return newNote
  }

  const updateNote = (noteId: number, updates: Partial<Note>) => {
    const now = Date.now()
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0],
            localUpdatedAt: now // 更新毫秒时间戳
          }
        : note
    )
    setNotes(updatedNotes)

    // 如果更新的是当前选中的笔记，同步更新 selectedNote
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, ...updates })
    }
  }

  const deleteNote = (noteId: number) => {
    // 找到要删除的笔记，记录其 cloudId
    const noteToDelete = notes.find(note => note.id === noteId)
    if (noteToDelete?.cloudId) {
      addDeletedCloudId(noteToDelete.cloudId, userId)
    }

    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)

    // 如果删除的是当前选中的笔记，选择第一条笔记或设为 null
    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null)
    }
  }

  const toggleFavorite = (noteId: number) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, isFavorite: !note.isFavorite }
        : note
    )
    setNotes(updatedNotes)

    // 如果切换的是当前选中的笔记，同步更新 selectedNote
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite })
    }
  }

  return {
    notes,
    selectedNote,
    setSelectedNote,
    setNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite
  }
}
