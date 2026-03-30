import type { Note } from '../types/index'

const STORAGE_KEY_PREFIX = 'noteflow_notes'
const DELETED_IDS_KEY_PREFIX = 'noteflow_deleted_cloud_ids'
const GUEST_USER_ID = 'guest' // 访客模式的固定 ID

/**
 * 获取当前用户的存储键
 */
function getStorageKey(userId?: string): string {
  const id = userId || GUEST_USER_ID
  return `${STORAGE_KEY_PREFIX}_${id}`
}

/**
 * 获取当前用户的删除记录键
 */
function getDeletedIdsKey(userId?: string): string {
  const id = userId || GUEST_USER_ID
  return `${DELETED_IDS_KEY_PREFIX}_${id}`
}

/**
 * 保存笔记到 LocalStorage（按用户隔离）
 */
export function saveNotes(notes: Note[], userId?: string): boolean {
  try {
    const data = JSON.stringify(notes)
    const key = getStorageKey(userId)
    localStorage.setItem(key, data)
    return true
  } catch (error) {
    console.error('保存笔记失败:', error)
    // 可能是存储空间不足或其他错误
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('存储空间不足，无法保存笔记')
    }
    return false
  }
}

/**
 * 从 LocalStorage 加载笔记（按用户隔离）
 */
export function loadNotes(userId?: string): Note[] {
  try {
    const key = getStorageKey(userId)
    const data = localStorage.getItem(key)
    if (!data) {
      return []
    }

    const notes = JSON.parse(data)

    // 数据验证
    if (!Array.isArray(notes)) {
      console.warn('笔记数据格式错误，返回空数组')
      return []
    }

    // 数据迁移：为旧笔记添加 cloudId 和 localUpdatedAt
    const migratedNotes = notes.map(note => {
      const needsMigration = !note.cloudId || !note.localUpdatedAt

      if (needsMigration) {
        return {
          ...note,
          cloudId: note.cloudId || crypto.randomUUID(),
          localUpdatedAt: note.localUpdatedAt || Date.now()
        }
      }

      return note
    })

    // 如果有笔记被迁移，保存回 LocalStorage
    if (migratedNotes.some((note, index) => note !== notes[index])) {
      saveNotes(migratedNotes, userId)
    }

    return migratedNotes
  } catch (error) {
    console.error('加载笔记失败:', error)
    return []
  }
}

/**
 * 清空所有笔记数据（按用户隔离）
 */
export function clearNotes(userId?: string): void {
  try {
    const key = getStorageKey(userId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('清空笔记失败:', error)
  }
}

/**
 * 添加已删除的 cloudId 到记录中（按用户隔离）
 */
export function addDeletedCloudId(cloudId: string, userId?: string): void {
  try {
    const deletedIds = getDeletedCloudIds(userId)
    if (!deletedIds.includes(cloudId)) {
      deletedIds.push(cloudId)
      const key = getDeletedIdsKey(userId)
      localStorage.setItem(key, JSON.stringify(deletedIds))
    }
  } catch (error) {
    console.error('记录删除失败:', error)
  }
}

/**
 * 获取已删除的 cloudId 列表（按用户隔离）
 */
export function getDeletedCloudIds(userId?: string): string[] {
  try {
    const key = getDeletedIdsKey(userId)
    const data = localStorage.getItem(key)
    if (!data) return []
    const ids = JSON.parse(data)
    return Array.isArray(ids) ? ids : []
  } catch (error) {
    console.error('读取删除记录失败:', error)
    return []
  }
}

/**
 * 清空删除记录（同步成功后调用，按用户隔离）
 */
export function clearDeletedCloudIds(userId?: string): void {
  try {
    const key = getDeletedIdsKey(userId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('清空删除记录失败:', error)
  }
}
