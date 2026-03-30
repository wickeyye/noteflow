import JSZip from 'jszip'
import type { Note } from '../types'

/**
 * 解析 Markdown 文件内容
 */
export function parseMarkdownFile(
  content: string,
  fileName: string
): Omit<Note, 'id' | 'updatedAt'> {
  const title = fileName.replace(/\.md$/i, '').trim() || '未命名笔记'
  return {
    cloudId: crypto.randomUUID(),
    title,
    content,
    tags: [],
    isFavorite: false,
    localUpdatedAt: Date.now()
  }
}

/**
 * 导入单个 Markdown 文件
 */
export async function importMarkdownFile(
  file: File
): Promise<Omit<Note, 'id' | 'updatedAt'>> {
  const content = await file.text()
  return parseMarkdownFile(content, file.name)
}

/**
 * 导入 ZIP 文件（批量导入）
 */
export async function importZipFile(
  file: File
): Promise<Array<Omit<Note, 'id' | 'updatedAt'>>> {
  const zip = await JSZip.loadAsync(file)
  const results: Array<Omit<Note, 'id' | 'updatedAt'>> = []

  for (const [fileName, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir && fileName.endsWith('.md')) {
      const content = await zipEntry.async('text')
      results.push(parseMarkdownFile(content, fileName))
    }
  }

  return results
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File): boolean {
  return file.name.endsWith('.md') || file.name.endsWith('.zip')
}
