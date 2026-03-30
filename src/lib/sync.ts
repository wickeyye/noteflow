import { supabase } from './supabase'
import type { Note } from '../types'
import { getDeletedCloudIds, clearDeletedCloudIds } from '../utils/storage'

export interface CloudNote {
  id: string              // 云端 UUID（对应 Note.cloudId）
  user_id: string
  title: string
  content: string
  is_favorite: boolean
  tags: string[]
  created_at: string
  updated_at: string
  local_updated_at: string // 毫秒时间戳（字符串格式）
}

/**
 * 将本地笔记转换为云端格式
 */
function localToCloud(note: Note, userId: string): Omit<CloudNote, 'created_at'> {
  return {
    id: note.cloudId || crypto.randomUUID(), // 使用 cloudId 作为云端 ID
    user_id: userId,
    title: note.title,
    content: note.content,
    is_favorite: note.isFavorite || false,
    tags: note.tags || [],
    updated_at: new Date(note.updatedAt).toISOString(),
    local_updated_at: String(note.localUpdatedAt || Date.now())
  }
}

/**
 * 将云端笔记转换为本地格式
 */
function cloudToLocal(cloudNote: CloudNote): Note {
  return {
    id: parseInt(cloudNote.id.replace(/-/g, '').substring(0, 13), 16), // 从 UUID 生成本地 ID
    cloudId: cloudNote.id, // 保存云端 UUID
    title: cloudNote.title,
    content: cloudNote.content,
    isFavorite: cloudNote.is_favorite,
    tags: cloudNote.tags || [],
    updatedAt: new Date(cloudNote.updated_at).toISOString().split('T')[0],
    localUpdatedAt: parseInt(cloudNote.local_updated_at) || Date.now()
  }
}

/**
 * 上传本地笔记到云端（使用 upsert 避免主键冲突）
 */
export async function uploadNotes(notes: Note[], userId: string): Promise<void> {
  if (!userId) return

  // 如果没有笔记，删除用户的所有笔记
  if (notes.length === 0) {
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('清理笔记失败:', deleteError)
      throw deleteError
    }
    return
  }

  // 使用 upsert 插入或更新笔记（避免主键冲突）
  const cloudNotes = notes.map(note => localToCloud(note, userId))

  const { error: upsertError } = await supabase
    .from('notes')
    .upsert(cloudNotes, {
      onConflict: 'id', // 主键冲突时更新
      ignoreDuplicates: false // 不忽略重复，而是更新
    })

  if (upsertError) {
    console.error('上传笔记失败:', upsertError)
    throw upsertError
  }

  // 删除云端多余的笔记（本地已删除的）
  const localCloudIds = notes.map(note => note.cloudId).filter(Boolean)

  if (localCloudIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${localCloudIds.join(',')})`)

    if (deleteError) {
      console.error('清理多余笔记失败:', deleteError)
      // 不抛出错误，因为主要操作已完成
    }
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
 * 同步笔记（方案 A：Last Write Wins + 删除记录）
 */
export async function syncNotes(localNotes: Note[], userId: string): Promise<Note[]> {
  if (!userId) return localNotes

  try {
    // 1. 下载云端笔记
    const cloudNotes = await downloadNotes(userId)

    // 2. 获取删除记录（按用户隔离）
    const deletedCloudIds = getDeletedCloudIds(userId)

    // 3. 为没有 cloudId 的本地笔记生成 cloudId
    const localNotesWithCloudId = localNotes.map(note => ({
      ...note,
      cloudId: note.cloudId || crypto.randomUUID(),
      localUpdatedAt: note.localUpdatedAt || Date.now()
    }))

    // 4. 建立映射关系（按 cloudId）
    const cloudMap = new Map(cloudNotes.map(note => [note.cloudId!, note]))
    const localMap = new Map(localNotesWithCloudId.map(note => [note.cloudId!, note]))

    // 5. 合并笔记
    const mergedNotes: Note[] = []
    const allCloudIds = new Set([...cloudMap.keys(), ...localMap.keys()])

    allCloudIds.forEach(cloudId => {
      const cloudNote = cloudMap.get(cloudId)
      const localNote = localMap.get(cloudId)

      if (cloudNote && localNote) {
        // 两边都有，比较 localUpdatedAt，保留最新的
        const cloudTime = cloudNote.localUpdatedAt
        const localTime = localNote.localUpdatedAt

        if (localTime > cloudTime) {
          mergedNotes.push(localNote)
        } else {
          mergedNotes.push(cloudNote)
        }
      } else if (cloudNote && !localNote) {
        // 只有云端有，本地没有
        if (deletedCloudIds.includes(cloudId)) {
          // 本地已删除，不加入合并结果（云端也会被删除）
          console.log(`笔记 ${cloudId} 已在本地删除，将从云端删除`)
        } else {
          // 云端新笔记，下载到本地
          mergedNotes.push(cloudNote)
        }
      } else if (localNote && !cloudNote) {
        // 只有本地有，上传到云端
        mergedNotes.push(localNote)
      }
    })

    // 6. 上传合并后的笔记到云端
    await uploadNotes(mergedNotes, userId)

    // 7. 同步成功后清空删除记录（按用户隔离）
    clearDeletedCloudIds(userId)

    return mergedNotes
  } catch (error) {
    console.error('同步失败:', error)
    return localNotes
  }
}
