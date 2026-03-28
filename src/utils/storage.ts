import { Note } from '../types'

const STORAGE_KEY = 'noteflow_notes'

/**
 * 保存笔记到 LocalStorage
 */
export function saveNotes(notes: Note[]): boolean {
  try {
    const data = JSON.stringify(notes)
    localStorage.setItem(STORAGE_KEY, data)
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
 * 从 LocalStorage 加载笔记
 */
export function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return []
    }

    const notes = JSON.parse(data)

    // 数据验证
    if (!Array.isArray(notes)) {
      console.warn('笔记数据格式错误，返回空数组')
      return []
    }

    return notes
  } catch (error) {
    console.error('加载笔记失败:', error)
    return []
  }
}

/**
 * 清空所有笔记数据
 */
export function clearNotes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('清空笔记失败:', error)
  }
}
