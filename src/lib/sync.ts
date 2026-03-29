import { supabase } from './supabase'
import type { Note } from '../types'

export interface CloudNote {
  id: string
  user_id: string
  title: string
  content: string
  is_favorite: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

/**
 * 将本地笔记转换为云端格式
 */
function localToCloud(note: Note, userId: string): Omit<CloudNote, 'id' | 'created_at'> {
  return {
    user_id: userId,
    title: note.title,
    content: note.content,
    is_favorite: note.isFavorite || false,
    tags: note.tags || [],
    updated_at: new Date(note.updatedAt).toISOString()
  }
}

/**
 * 将云端笔记转换为本地格式
 */
function cloudToLocal(cloudNote: CloudNote): Note {
  return {
    id: parseInt(cloudNote.id.replace(/-/g, '').substring(0, 13), 16),
    title: cloudNote.title,
    content: cloudNote.content,
    isFavorite: cloudNote.is_favorite,
    tags: cloudNote.tags || [],
    updatedAt: new Date(cloudNote.updated_at).toISOString().split('T')[0]
  }
}

/**
 * 上传本地笔记到云端
 */
export async function uploadNotes(notes: Note[], userId: string): Promise<void> {
  if (!userId || notes.length === 0) return

  const cloudNotes = notes.map(note => localToCloud(note, userId))

  const { error } = await supabase
    .from('notes')
    .upsert(cloudNotes, { onConflict: 'user_id,title' })

  if (error) {
    console.error('上传笔记失败:', error)
    throw error
  }
}

/**
 * 从云端下载笔记
 */
export async function downloadNotes(userId: string): Promise<Note[]> {
  if (!userId) return []

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('下载笔记失败:', error)
    throw error
  }

  return (data || []).map(cloudToLocal)
}

/**
 * 同步笔记（合并本地和云端）
 */
export async function syncNotes(localNotes: Note[], userId: string): Promise<Note[]> {
  if (!userId) return localNotes

  try {
    // 下载云端笔记
    const cloudNotes = await downloadNotes(userId)

    // 创建笔记映射（按标题）
    const cloudMap = new Map(cloudNotes.map(note => [note.title, note]))
    const localMap = new Map(localNotes.map(note => [note.title, note]))

    // 合并笔记（保留最新的）
    const mergedNotes: Note[] = []
    const allTitles = new Set([...cloudMap.keys(), ...localMap.keys()])

    allTitles.forEach(title => {
      const cloudNote = cloudMap.get(title)
      const localNote = localMap.get(title)

      if (cloudNote && localNote) {
        // 两边都有，保留最新的
        const cloudTime = new Date(cloudNote.updatedAt).getTime()
        const localTime = new Date(localNote.updatedAt).getTime()
        mergedNotes.push(cloudTime > localTime ? cloudNote : localNote)
      } else if (cloudNote) {
        mergedNotes.push(cloudNote)
      } else if (localNote) {
        mergedNotes.push(localNote)
      }
    })

    // 上传本地新增或更新的笔记
    await uploadNotes(mergedNotes, userId)

    return mergedNotes
  } catch (error) {
    console.error('同步失败:', error)
    return localNotes
  }
}
