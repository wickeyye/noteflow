# Export/Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add note export/import functionality supporting Markdown format

**Architecture:** Pure frontend implementation using file-saver for downloads, jszip for batch operations, HTML5 File API for uploads

**Tech Stack:** React 19, TypeScript 5.9, file-saver, jszip

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install file-saver and jszip**

Run: `npm install file-saver jszip`
Expected: Dependencies added to package.json

- [ ] **Step 2: Install type definitions**

Run: `npm install --save-dev @types/file-saver`
Expected: Dev dependency added

- [ ] **Step 3: Verify installation**

Run: `npm list file-saver jszip`
Expected: Both packages listed with versions

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add file-saver and jszip dependencies"
```

---

## Task 2: Create Export Utility Functions

**Files:**
- Create: `src/utils/export.ts`

- [ ] **Step 1: Write test for sanitizeFileName**

Create `src/utils/export.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { sanitizeFileName } from './export'

describe('sanitizeFileName', () => {
  it('removes invalid characters', () => {
    expect(sanitizeFileName('test/file:name')).toBe('test-file-name')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test export.test.ts`
Expected: FAIL with "sanitizeFileName not defined"

- [ ] **Step 3: Implement sanitizeFileName**

In `src/utils/export.ts`:

```typescript
export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '-').trim()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test export.test.ts`
Expected: PASS

- [ ] **Step 5: Write test for exportNoteAsMarkdown**

Add to `src/utils/export.test.ts`:

```typescript
import { exportNoteAsMarkdown } from './export'
import type { Note } from '../types'

it('exports note as markdown file', () => {
  const note: Note = {
    id: 1,
    title: 'Test Note',
    content: '# Hello\nWorld',
    updatedAt: '2026-03-29'
  }

  const mockSaveAs = vi.fn()
  vi.mock('file-saver', () => ({ saveAs: mockSaveAs }))

  exportNoteAsMarkdown(note)
  expect(mockSaveAs).toHaveBeenCalled()
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test export.test.ts`
Expected: FAIL with "exportNoteAsMarkdown not defined"

- [ ] **Step 7: Implement exportNoteAsMarkdown**

Add to `src/utils/export.ts`:

```typescript
import { saveAs } from 'file-saver'
import type { Note } from '../types'

export function exportNoteAsMarkdown(note: Note): void {
  const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' })
  const fileName = sanitizeFileName(note.title) + '.md'
  saveAs(blob, fileName)
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test export.test.ts`
Expected: PASS

- [ ] **Step 9: Write test for exportAllNotesAsZip**

Add to `src/utils/export.test.ts`:

```typescript
import { exportAllNotesAsZip } from './export'

it('exports all notes as zip file', async () => {
  const notes: Note[] = [
    { id: 1, title: 'Note 1', content: 'Content 1', updatedAt: '2026-03-29' },
    { id: 2, title: 'Note 2', content: 'Content 2', updatedAt: '2026-03-29' }
  ]

  const mockSaveAs = vi.fn()
  vi.mock('file-saver', () => ({ saveAs: mockSaveAs }))

  await exportAllNotesAsZip(notes)
  expect(mockSaveAs).toHaveBeenCalled()
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npm test export.test.ts`
Expected: FAIL with "exportAllNotesAsZip not defined"

- [ ] **Step 11: Implement exportAllNotesAsZip**

Add to `src/utils/export.ts`:

```typescript
import JSZip from 'jszip'

export async function exportAllNotesAsZip(notes: Note[]): Promise<void> {
  const zip = new JSZip()

  notes.forEach(note => {
    const fileName = sanitizeFileName(note.title) + '.md'
    zip.file(fileName, note.content)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const timestamp = new Date().toISOString().split('T')[0]
  saveAs(blob, `noteflow-notes-${timestamp}.zip`)
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npm test export.test.ts`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add src/utils/export.ts src/utils/export.test.ts
git commit -m "feat: add export utility functions for markdown and zip"
```

---

## Task 3: Create Import Utility Functions

**Files:**
- Create: `src/utils/import.ts`

- [ ] **Step 1: Write test for parseMarkdownFile**

Create `src/utils/import.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseMarkdownFile } from './import'

describe('parseMarkdownFile', () => {
  it('parses markdown content and filename', () => {
    const result = parseMarkdownFile('# Hello\nWorld', 'test-note.md')
    expect(result.title).toBe('test-note')
    expect(result.content).toBe('# Hello\nWorld')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test import.test.ts`
Expected: FAIL with "parseMarkdownFile not defined"

- [ ] **Step 3: Implement parseMarkdownFile**

In `src/utils/import.ts`:

```typescript
import type { Note } from '../types'

export function parseMarkdownFile(content: string, fileName: string): Omit<Note, 'id' | 'updatedAt'> {
  const title = fileName.replace(/\.md$/i, '')
  return { title, content }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test import.test.ts`
Expected: PASS

- [ ] **Step 5: Write test for importMarkdownFile**

Add to `src/utils/import.test.ts`:

```typescript
import { importMarkdownFile } from './import'

it('imports markdown file', async () => {
  const file = new File(['# Hello\nWorld'], 'test.md', { type: 'text/markdown' })
  const result = await importMarkdownFile(file)
  expect(result.title).toBe('test')
  expect(result.content).toBe('# Hello\nWorld')
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test import.test.ts`
Expected: FAIL with "importMarkdownFile not defined"

- [ ] **Step 7: Implement importMarkdownFile**

Add to `src/utils/import.ts`:

```typescript
export async function importMarkdownFile(file: File): Promise<Omit<Note, 'id' | 'updatedAt'>> {
  const content = await file.text()
  return parseMarkdownFile(content, file.name)
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test import.test.ts`
Expected: PASS

- [ ] **Step 9: Write test for importZipFile**

Add to `src/utils/import.test.ts`:

```typescript
import { importZipFile } from './import'
import JSZip from 'jszip'

it('imports zip file with multiple notes', async () => {
  const zip = new JSZip()
  zip.file('note1.md', '# Note 1')
  zip.file('note2.md', '# Note 2')
  const blob = await zip.generateAsync({ type: 'blob' })
  const file = new File([blob], 'notes.zip', { type: 'application/zip' })

  const results = await importZipFile(file)
  expect(results).toHaveLength(2)
  expect(results[0].title).toBe('note1')
  expect(results[1].title).toBe('note2')
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npm test import.test.ts`
Expected: FAIL with "importZipFile not defined"

- [ ] **Step 11: Implement importZipFile**

Add to `src/utils/import.ts`:

```typescript
import JSZip from 'jszip'

export async function importZipFile(file: File): Promise<Array<Omit<Note, 'id' | 'updatedAt'>>> {
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
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npm test import.test.ts`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add src/utils/import.ts src/utils/import.test.ts
git commit -m "feat: add import utility functions for markdown and zip"
```

---

## Task 4: Update Editor Component

**Files:**
- Modify: `src/components/Editor.tsx:1-200`

- [ ] **Step 1: Add import statements**

At top of `src/components/Editor.tsx`:

```typescript
import { exportNoteAsMarkdown } from '../utils/export'
```

- [ ] **Step 2: Add export button to toolbar**

In the toolbar section (after font controls), add:

```typescript
<button
  onClick={() => exportNoteAsMarkdown(currentNote)}
  className="toolbar-button"
  title="导出笔记"
>
  导出 ▼
</button>
```

- [ ] **Step 3: Test export button renders**

Run: `npm run dev`
Open browser, verify export button appears in toolbar

- [ ] **Step 4: Test export functionality**

Click export button, verify .md file downloads

- [ ] **Step 5: Commit**

```bash
git add src/components/Editor.tsx
git commit -m "feat: add export button to editor toolbar"
```

---

## Task 5: Update App Component with Import

**Files:**
- Modify: `src/App.tsx:1-150`

- [ ] **Step 1: Add import statements**

At top of `src/App.tsx`:

```typescript
import { exportAllNotesAsZip } from './utils/export'
import { importMarkdownFile, importZipFile } from './utils/import'
```

- [ ] **Step 2: Add import handler function**

In App component:

```typescript
const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const file = files[0]

  try {
    if (file.name.endsWith('.zip')) {
      const importedNotes = await importZipFile(file)
      importedNotes.forEach(noteData => addNote(noteData.title, noteData.content))
    } else if (file.name.endsWith('.md')) {
      const noteData = await importMarkdownFile(file)
      addNote(noteData.title, noteData.content)
    }
  } catch (error) {
    console.error('Import failed:', error)
    alert('导入失败，请检查文件格式')
  }

  event.target.value = ''
}
```

- [ ] **Step 3: Add export all button to Sidebar**

In `src/components/Sidebar.tsx`, add button after search:

```typescript
<button
  onClick={() => exportAllNotesAsZip(notes)}
  className="export-all-button"
  title="导出所有笔记"
>
  导出全部
</button>
```

- [ ] **Step 4: Add import button to Editor toolbar**

In `src/components/Editor.tsx`, add after export button:

```typescript
<label className="toolbar-button" title="导入笔记">
  导入
  <input
    type="file"
    accept=".md,.zip"
    onChange={handleImport}
    style={{ display: 'none' }}
  />
</label>
```

- [ ] **Step 5: Pass handleImport to Editor**

In `src/App.tsx`, pass handler to Editor:

```typescript
<Editor
  currentNote={currentNote}
  onUpdate={updateNote}
  onImport={handleImport}
/>
```

- [ ] **Step 6: Update Editor props type**

In `src/components/Editor.tsx`:

```typescript
interface EditorProps {
  currentNote: Note | null
  onUpdate: (id: number, content: string) => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}
```

- [ ] **Step 7: Test import single markdown**

Run: `npm run dev`
Create test.md file, import it, verify note created

- [ ] **Step 8: Test import zip file**

Create zip with multiple .md files, import, verify all notes created

- [ ] **Step 9: Test export all**

Click "导出全部", verify ZIP downloads with all notes

- [ ] **Step 10: Commit**

```bash
git add src/App.tsx src/components/Editor.tsx src/components/Sidebar.tsx
git commit -m "feat: add import/export UI controls and handlers"
```

---

## Task 6: Add Styles

**Files:**
- Modify: `src/App.css:1-500`

- [ ] **Step 1: Add export/import button styles**

Add to `src/App.css`:

```css
.toolbar-button {
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background: #333;
  border-color: #4a9eff;
}

.export-all-button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.export-all-button:hover {
  background: #333;
  border-color: #4a9eff;
}
```

- [ ] **Step 2: Test styles**

Run: `npm run dev`
Verify buttons have correct styling and hover effects

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "style: add export/import button styles"
```

---

## Task 7: Integration Testing

**Files:**
- Test: All components

- [ ] **Step 1: Test export single note**

1. Create a note with title "测试笔记" and content "# Hello\nWorld"
2. Click "导出 ▼" button
3. Verify file "测试笔记.md" downloads
4. Open file, verify content matches

- [ ] **Step 2: Test export all notes**

1. Create 3 notes with different content
2. Click "导出全部" button
3. Verify ZIP file downloads with format "noteflow-notes-YYYY-MM-DD.zip"
4. Extract ZIP, verify 3 .md files exist with correct content

- [ ] **Step 3: Test import single markdown**

1. Create test.md file with content "# Imported\nTest content"
2. Click "导入" button, select test.md
3. Verify new note created with title "test"
4. Verify content matches file content

- [ ] **Step 4: Test import ZIP file**

1. Create ZIP with 2 .md files: note1.md, note2.md
2. Click "导入" button, select ZIP file
3. Verify 2 new notes created
4. Verify titles are "note1" and "note2"
5. Verify content matches

- [ ] **Step 5: Test error handling**

1. Try importing invalid file (e.g., .txt)
2. Verify error alert shows
3. Try importing corrupted ZIP
4. Verify error alert shows

- [ ] **Step 6: Test filename sanitization**

1. Create note with title "test/file:name"
2. Export note
3. Verify filename is "test-file-name.md"

- [ ] **Step 7: Document test results**

Create test report noting any issues found

---

## Task 8: Update Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Update CLAUDE.md features list**

In "已实现功能" section, add:

```markdown
- ✅ 笔记导出 (单个 Markdown / 批量 ZIP)
- ✅ 笔记导入 (单个 Markdown / 批量 ZIP)
```

- [ ] **Step 2: Update CLAUDE.md tech stack**

In "技术选型原则" section, update:

```markdown
- **导出/导入**: file-saver + jszip (已实现)
```

- [ ] **Step 3: Update README.md**

Add export/import feature description and usage instructions

- [ ] **Step 4: Commit documentation**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update documentation for export/import features"
```

---
