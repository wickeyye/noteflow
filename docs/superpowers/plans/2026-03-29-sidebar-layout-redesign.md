# 侧边栏布局重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重新设计侧边栏布局，添加可折叠分类区域和紧凑笔记列表，提高空间利用率

**Architecture:** 创建 CollapsibleSection 可复用组件，重构 Sidebar 为三个分类区域（最近、收藏、全部笔记），使用紧凑的笔记列表项设计，添加收藏功能和折叠状态管理

**Tech Stack:** React 19, TypeScript 5.9, CSS Modules, LocalStorage

---

## 文件结构

**需要修改的文件：**
- `src/types/index.ts` - 添加 `isFavorite` 字段和 `CollapsedSections` 接口
- `src/hooks/useNotes.ts` - 添加 `toggleFavorite` 方法
- `src/components/Sidebar.tsx` - 重构为分类结构
- `src/App.css` - 更新样式为紧凑设计
- `src/App.tsx` - 添加折叠状态管理

**不需要修改的文件：**
- `src/components/Editor.tsx` - 编辑器组件保持不变
- `src/hooks/useKeyboard.ts` - 快捷键逻辑保持不变
- `src/utils/storage.ts` - 存储工具保持不变

---

## Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts:1-7`

- [ ] **Step 1: 添加 isFavorite 字段到 Note 接口**

```typescript
export type Note = {
  id: number
  title: string
  content: string
  updatedAt: string
  tags: string[]
  isFavorite?: boolean
}

export type CollapsedSections = {
  recent: boolean
  favorite: boolean
  all: boolean
}
```

- [ ] **Step 2: 验证类型定义**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 3: 提交更改**

```bash
git add src/types/index.ts
git commit -m "feat: 添加 isFavorite 字段和 CollapsedSections 类型

- 在 Note 接口中添加可选的 isFavorite 字段
- 添加 CollapsedSections 类型用于管理折叠状态

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 更新 useNotes Hook

**Files:**
- Modify: `src/hooks/useNotes.ts:1-86`

- [ ] **Step 1: 在 createNote 中添加 isFavorite 默认值**

```typescript
const createNote = () => {
  const newNote: Note = {
    id: Date.now(),
    title: '新建笔记',
    content: '',
    updatedAt: new Date().toISOString().split('T')[0],
    tags: [],
    isFavorite: false
  }
  setNotes([newNote, ...notes])
  setSelectedNote(newNote)
}
```

- [ ] **Step 2: 添加 toggleFavorite 方法**

```typescript
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
```

- [ ] **Step 3: 在返回值中导出 toggleFavorite**

```typescript
return {
  notes,
  selectedNote,
  setSelectedNote,
  createNote,
  updateNote,
  deleteNote,
  toggleFavorite
}
```

- [ ] **Step 4: 验证编译**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 5: 提交更改**

```bash
git add src/hooks/useNotes.ts
git commit -m "feat: 添加收藏功能到 useNotes Hook

- 在 createNote 中添加 isFavorite 默认值为 false
- 添加 toggleFavorite 方法用于切换收藏状态
- 导出 toggleFavorite 方法

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 创建 CollapsibleSection 组件

**Files:**
- Create: `src/components/CollapsibleSection.tsx`

- [ ] **Step 1: 创建 CollapsibleSection 组件文件**

```typescript
import type { ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  icon: string
  count: number
  isCollapsed: boolean
  onToggle: () => void
  children: ReactNode
}

export function CollapsibleSection({
  title,
  icon,
  count,
  isCollapsed,
  onToggle,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="collapsible-section">
      <div className="section-header" onClick={onToggle}>
        <span className="section-arrow">{isCollapsed ? '▶' : '▼'}</span>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        <span className="section-count">({count})</span>
      </div>
      <div className={`section-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 3: 提交更改**

```bash
git add src/components/CollapsibleSection.tsx
git commit -m "feat: 创建 CollapsibleSection 可复用组件

- 支持折叠/展开功能
- 显示分类标题、图标和笔记数量
- 使用 CSS 类控制折叠状态

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 重构 Sidebar 组件 - 第一部分（创建辅助组件）

**Files:**
- Create: `src/components/CompactNoteItem.tsx`

- [ ] **Step 1: 创建 CompactNoteItem 组件**

```typescript
import type { Note } from '../types/index'

interface CompactNoteItemProps {
  note: Note
  isActive: boolean
  onSelect: () => void
  onToggleFavorite: () => void
  onDelete: (e: React.MouseEvent) => void
}

export function CompactNoteItem({
  note,
  isActive,
  onSelect,
  onToggleFavorite,
  onDelete
}: CompactNoteItemProps) {
  return (
    <div
      className={`compact-note-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="note-info">
        <span className="note-title">{note.title}</span>
        <span className="note-date">{note.updatedAt}</span>
      </div>
      <div className="note-actions">
        <button
          className="btn-favorite"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          title={note.isFavorite ? '取消收藏' : '收藏'}
        >
          {note.isFavorite ? '⭐' : '☆'}
        </button>
        <button
          className="btn-delete"
          onClick={onDelete}
          title="删除笔记"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 3: 提交更改**

```bash
git add src/components/CompactNoteItem.tsx
git commit -m "feat: 创建 CompactNoteItem 紧凑笔记项组件

- 只显示标题和日期，去掉内容预览
- 添加收藏按钮和删除按钮
- 支持激活状态显示

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 重构 Sidebar 组件 - 第二部分（主组件重构）

**Files:**
- Modify: `src/components/Sidebar.tsx:1-152`

- [ ] **Step 1: 更新导入语句**

```typescript
import type { Note, CollapsedSections } from '../types/index'
import { CollapsibleSection } from './CollapsibleSection'
import { CompactNoteItem } from './CompactNoteItem'

type SortOption = 'time' | 'title'

interface SidebarProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  selectedTag: string | null
  sortBy: SortOption
  collapsedSections: CollapsedSections
  searchInputRef?: React.RefObject<HTMLInputElement>
  onSearchChange: (query: string) => void
  onTagSelect: (tag: string | null) => void
  onSortChange: (sortBy: SortOption) => void
  onNoteSelect: (note: Note) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: number, e: React.MouseEvent) => void
  onToggleFavorite: (noteId: number) => void
  onToggleSection: (section: keyof CollapsedSections) => void
}
```

- [ ] **Step 2: 实现笔记筛选逻辑**

```typescript
export function Sidebar({
  notes,
  selectedNote,
  searchQuery,
  selectedTag,
  sortBy,
  collapsedSections,
  searchInputRef,
  onSearchChange,
  onTagSelect,
  onSortChange,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onToggleFavorite,
  onToggleSection
}: SidebarProps) {
  // 收集所有标签
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  ).sort()

  // 筛选最近笔记（7天内）
  const getRecentNotes = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    
    return notes
      .filter(note => note.updatedAt >= sevenDaysAgoStr)
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  // 筛选收藏笔记
  const getFavoriteNotes = () => {
    return notes
      .filter(note => note.isFavorite)
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  // 筛选全部笔记
  const getAllNotes = () => {
    return notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        const noteTags = note.tags || []
        const matchesTag = !selectedTag || noteTags.includes(selectedTag)
        return matchesSearch && matchesTag
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        } else {
          return a.title.localeCompare(b.title)
        }
      })
  }

  const recentNotes = getRecentNotes()
  const favoriteNotes = getFavoriteNotes()
  const allNotes = getAllNotes()
```

- [ ] **Step 3: 实现渲染逻辑 - 顶部区域**

```typescript
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">📝 NoteFlow</h1>
        <div className="notes-count">共 {notes.length} 条笔记</div>
        <button className="btn-new" onClick={onNoteCreate}>
          + 新建笔记
        </button>
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍 搜索笔记..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
```

- [ ] **Step 4: 实现渲染逻辑 - 分类区域**

```typescript
      {/* 分类区域 */}
      <div className="sections-container">
        {/* 最近笔记 */}
        <CollapsibleSection
          title="最近"
          icon="📌"
          count={recentNotes.length}
          isCollapsed={collapsedSections.recent}
          onToggle={() => onToggleSection('recent')}
        >
          {recentNotes.length === 0 ? (
            <div className="empty-section">最近 7 天没有编辑笔记</div>
          ) : (
            recentNotes.map(note => (
              <CompactNoteItem
                key={note.id}
                note={note}
                isActive={selectedNote?.id === note.id}
                onSelect={() => onNoteSelect(note)}
                onToggleFavorite={() => onToggleFavorite(note.id)}
                onDelete={(e) => onNoteDelete(note.id, e)}
              />
            ))
          )}
        </CollapsibleSection>

        {/* 收藏笔记 */}
        <CollapsibleSection
          title="收藏"
          icon="⭐"
          count={favoriteNotes.length}
          isCollapsed={collapsedSections.favorite}
          onToggle={() => onToggleSection('favorite')}
        >
          {favoriteNotes.length === 0 ? (
            <div className="empty-section">还没有收藏的笔记</div>
          ) : (
            favoriteNotes.map(note => (
              <CompactNoteItem
                key={note.id}
                note={note}
                isActive={selectedNote?.id === note.id}
                onSelect={() => onNoteSelect(note)}
                onToggleFavorite={() => onToggleFavorite(note.id)}
                onDelete={(e) => onNoteDelete(note.id, e)}
              />
            ))
          )}
        </CollapsibleSection>

        {/* 全部笔记 */}
        <CollapsibleSection
          title="全部笔记"
          icon="📚"
          count={allNotes.length}
          isCollapsed={collapsedSections.all}
          onToggle={() => onToggleSection('all')}
        >
          {/* 排序选项 */}
          <div className="sort-options">
            <button
              className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`}
              onClick={() => onSortChange('time')}
            >
              🕒 按时间
            </button>
            <button
              className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
              onClick={() => onSortChange('title')}
            >
              🔤 按标题
            </button>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="tags-filter">
              <div className="tags-filter-header">🏷️ 标签筛选</div>
              <div className="tags-filter-list">
                <button
                  className={`filter-tag ${!selectedTag ? 'active' : ''}`}
                  onClick={() => onTagSelect(null)}
                >
                  全部
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`filter-tag ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => onTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 笔记列表 */}
          {allNotes.length === 0 ? (
            <div className="empty-section">
              {searchQuery ? '没有找到匹配的笔记' : '还没有笔记'}
            </div>
          ) : (
            allNotes.map(note => (
              <CompactNoteItem
                key={note.id}
                note={note}
                isActive={selectedNote?.id === note.id}
                onSelect={() => onNoteSelect(note)}
                onToggleFavorite={() => onToggleFavorite(note.id)}
                onDelete={(e) => onNoteDelete(note.id, e)}
              />
            ))
          )}
        </CollapsibleSection>
      </div>
    </aside>
  )
}
```

- [ ] **Step 5: 验证编译**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 6: 提交更改**

```bash
git add src/components/Sidebar.tsx
git commit -m "refactor: 重构 Sidebar 为分类结构

- 添加三个可折叠分类区域（最近、收藏、全部笔记）
- 使用 CompactNoteItem 组件显示紧凑笔记列表
- 实现最近笔记筛选（7天内）
- 将排序和标签筛选移到全部笔记分类内部

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 更新样式 - 第一部分（紧凑笔记列表项）

**Files:**
- Modify: `src/App.css:160-226`

- [ ] **Step 1: 更新紧凑笔记列表项样式**

在 App.css 中找到 `.note-item` 相关样式，替换为：

```css
/* 紧凑笔记列表项 */
.compact-note-item {
  padding: 10px 14px;
  margin-bottom: 4px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compact-note-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
  border-color: var(--border-color);
}

.compact-note-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.note-info {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.compact-note-item .note-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  letter-spacing: -0.01em;
}

.compact-note-item .note-date {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.note-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.compact-note-item:hover .note-actions {
  opacity: 1;
}

.btn-favorite {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: var(--text-tertiary);
}

.btn-favorite:hover {
  background: rgba(255, 193, 7, 0.15);
  transform: scale(1.1);
}
```

- [ ] **Step 2: 验证样式**

Run: `npm run dev`
打开浏览器查看样式是否正确应用

- [ ] **Step 3: 提交更改**

```bash
git add src/App.css
git commit -m "style: 更新紧凑笔记列表项样式

- 减少内边距从 16px 到 10px
- 减少间距从 8px 到 4px
- 标题字号从 16px 减少到 14px
- 去掉内容预览，只显示标题和日期
- 添加收藏按钮样式

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 更新样式 - 第二部分（分类区域）

**Files:**
- Modify: `src/App.css` (追加新样式)

- [ ] **Step 1: 添加分类区域样式**

在 App.css 末尾追加：

```css
/* 分类区域样式 */
.sections-container {
  flex: 1;
  overflow-y: auto;
}

.collapsible-section {
  border-bottom: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.section-header:hover {
  background: var(--bg-hover);
}

.section-arrow {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.section-count {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.section-content {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.section-content.expanded {
  max-height: 10000px;
  opacity: 1;
}

.section-content.collapsed {
  max-height: 0;
  opacity: 0;
}

.empty-section {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}

/* 调整排序和标签筛选在全部笔记分类内的样式 */
.collapsible-section .sort-options {
  padding: 12px 16px 8px;
  border-bottom: none;
}

.collapsible-section .tags-filter {
  padding: 8px 16px 12px;
  border-bottom: none;
}
```

- [ ] **Step 2: 验证样式**

Run: `npm run dev`
打开浏览器查看分类区域样式是否正确

- [ ] **Step 3: 提交更改**

```bash
git add src/App.css
git commit -m "style: 添加分类区域样式

- 添加可折叠分类区域样式
- 实现折叠/展开动画
- 调整排序和标签筛选在分类内的样式

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 更新 App 组件添加折叠状态管理

**Files:**
- Modify: `src/App.tsx:1-104`

- [ ] **Step 1: 导入新类型和更新状态**

```typescript
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useNotes } from './hooks/useNotes'
import { useKeyboard } from './hooks/useKeyboard'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
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
```

- [ ] **Step 2: 添加折叠状态持久化**

```typescript
  useEffect(() => {
    localStorage.setItem('noteflow_sort', sortBy)
  }, [sortBy])

  useEffect(() => {
    localStorage.setItem('noteflow_collapsed_sections', JSON.stringify(collapsedSections))
  }, [collapsedSections])
```

- [ ] **Step 3: 添加折叠切换处理函数**

```typescript
  const handleToggleSection = (section: keyof CollapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
```

- [ ] **Step 4: 更新 Sidebar 组件调用**

```typescript
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
      />
    </div>
  )
}

export default App
```

- [ ] **Step 5: 验证编译**

Run: `npm run build`
Expected: 编译成功，无类型错误

- [ ] **Step 6: 提交更改**

```bash
git add src/App.tsx
git commit -m "feat: 添加折叠状态管理到 App 组件

- 添加 collapsedSections 状态管理
- 实现折叠状态持久化到 LocalStorage
- 添加 handleToggleSection 处理函数
- 传递 toggleFavorite 和 onToggleSection 到 Sidebar

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: 测试和验证

**Files:**
- Test: 整个应用

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器成功启动，无错误

- [ ] **Step 2: 测试收藏功能**

手动测试：
1. 打开应用
2. 悬停在笔记项上，点击星标按钮
3. 验证笔记出现在"收藏"分类中
4. 再次点击星标，验证笔记从"收藏"分类中移除

Expected: 收藏功能正常工作，状态持久化

- [ ] **Step 3: 测试折叠/展开功能**

手动测试：
1. 点击"最近"分类标题
2. 验证分类折叠，箭头变为向右
3. 再次点击，验证分类展开
4. 刷新页面，验证折叠状态保持

Expected: 折叠功能正常，状态持久化

- [ ] **Step 4: 测试最近笔记筛选**

手动测试：
1. 创建一条新笔记
2. 验证新笔记出现在"最近"分类中
3. 修改笔记的 updatedAt 为 8 天前（通过浏览器控制台）
4. 刷新页面，验证笔记不再出现在"最近"分类中

Expected: 最近笔记筛选正确（7天内）

- [ ] **Step 5: 测试搜索功能**

手动测试：
1. 在搜索框输入关键词
2. 验证所有分类中的笔记都被筛选
3. 清空搜索框，验证所有笔记恢复显示

Expected: 搜索功能在所有分类中正常工作

- [ ] **Step 6: 测试排序和标签筛选**

手动测试：
1. 展开"全部笔记"分类
2. 点击"按标题"排序，验证笔记按标题排序
3. 选择一个标签，验证只显示该标签的笔记
4. 验证排序和筛选不影响"最近"和"收藏"分类

Expected: 排序和标签筛选只影响"全部笔记"分类

- [ ] **Step 7: 测试紧凑布局**

手动测试：
1. 对比新旧布局的笔记显示数量
2. 验证在相同高度下，新布局显示更多笔记
3. 验证笔记项只显示标题和日期，无内容预览

Expected: 空间利用率提升约 100%，可见笔记数量翻倍

- [ ] **Step 8: 测试所有现有功能**

手动测试：
1. 创建新笔记
2. 编辑笔记标题和内容
3. 添加标签
4. 删除笔记
5. 测试快捷键（Ctrl+N, Ctrl+F, Ctrl+Delete）
6. 测试 Markdown 预览

Expected: 所有现有功能正常工作，无回归问题

- [ ] **Step 9: 最终提交**

```bash
git add -A
git commit -m "test: 验证侧边栏布局重设计功能

- 测试收藏功能
- 测试折叠/展开功能
- 测试最近笔记筛选
- 测试搜索、排序、标签筛选
- 验证所有现有功能正常

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 自审清单

**规格覆盖检查：**
- ✅ Task 1: 数据模型变化 - 添加 isFavorite 字段
- ✅ Task 2: 收藏功能 - toggleFavorite 方法
- ✅ Task 3: 可折叠组件 - CollapsibleSection
- ✅ Task 4-5: 侧边栏重构 - 三个分类区域
- ✅ Task 6-7: 紧凑样式 - 减少内边距和间距
- ✅ Task 8: 折叠状态管理 - LocalStorage 持久化
- ✅ Task 9: 测试验证 - 所有功能测试

**占位符检查：**
- ✅ 无 TBD、TODO 或占位符
- ✅ 所有代码块完整
- ✅ 所有命令具体明确

**类型一致性检查：**
- ✅ Note 接口在所有任务中一致
- ✅ CollapsedSections 类型定义和使用一致
- ✅ 组件 Props 接口定义完整

---

## 实现完成标准

完成所有任务后，应该达到以下标准：

1. ✅ 侧边栏显示三个可折叠分类区域（最近、收藏、全部笔记）
2. ✅ 笔记列表项只显示标题和日期，无内容预览
3. ✅ 在相同空间内可见笔记数量翻倍（从 6 条到 12 条）
4. ✅ 收藏功能正常工作，状态持久化
5. ✅ 折叠/展开状态持久化到 LocalStorage
6. ✅ 最近笔记自动筛选（7 天内）
7. ✅ 搜索、排序、标签筛选功能正常
8. ✅ 所有现有功能保持不变，无回归问题

