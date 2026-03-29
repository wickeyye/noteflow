import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import type { Note } from '../types'

/**
 * 清理文件名，移除特殊字符
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '-').trim() || '未命名笔记'
}

/**
 * 导出单个笔记为 Markdown 文件
 */
export function exportNoteAsMarkdown(note: Note): void {
  const blob = new Blob([note.content], {
    type: 'text/markdown;charset=utf-8'
  })
  const fileName = sanitizeFileName(note.title) + '.md'
  saveAs(blob, fileName)
}

/**
 * 导出所有笔记为 ZIP 文件
 */
export async function exportAllNotesAsZip(notes: Note[]): Promise<void> {
  if (notes.length === 0) {
    alert('没有笔记可以导出')
    return
  }

  const zip = new JSZip()
  const usedNames = new Set<string>()

  notes.forEach(note => {
    let fileName = sanitizeFileName(note.title) + '.md'

    // 处理重名文件
    let counter = 2
    while (usedNames.has(fileName)) {
      const baseName = sanitizeFileName(note.title)
      fileName = `${baseName}-${counter}.md`
      counter++
    }

    usedNames.add(fileName)
    zip.file(fileName, note.content)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const timestamp = new Date().toISOString().split('T')[0]
  saveAs(blob, `NoteFlow-备份-${timestamp}.zip`)
}
