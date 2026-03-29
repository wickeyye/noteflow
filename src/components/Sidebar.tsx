import type { Note, CollapsedSections } from '../types/index'
import { CollapsibleSection } from './CollapsibleSection'
import { CompactNoteItem } from './CompactNoteItem'
import { exportAllNotesAsZip } from '../utils/export'

type SortOption = 'time' | 'title'

interface SidebarProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  selectedTag: string | null
  sortBy: SortOption
  collapsedSections: CollapsedSections
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  onSearchChange: (query: string) => void
  onTagSelect: (tag: string | null) => void
  onSortChange: (sortBy: SortOption) => void
  onNoteSelect: (note: Note) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: number, e: React.MouseEvent) => void
  onToggleFavorite: (noteId: number) => void
  onToggleSection: (section: keyof CollapsedSections) => void
}

export function Sidebar({
  notes,
  selectedNote,
  searchQuery,
  sortBy,
  collapsedSections,
  searchInputRef,
  onSearchChange,
  onSortChange,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onToggleFavorite,
  onToggleSection
}: SidebarProps) {
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
        return matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        } else {
          return a.title.localeCompare(b.title)
        }
      })
  }

  const favoriteNotes = getFavoriteNotes()
  const allNotes = getAllNotes()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">📝 NoteFlow</h1>
        <div className="notes-count">共 {notes.length} 条笔记</div>
        <div className="header-actions">
          <div className="header-actions-row">
            <button className="btn-new" onClick={onNoteCreate}>
              + 新建
            </button>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="🔍 搜索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            className="btn-export-all"
            onClick={() => exportAllNotesAsZip(notes)}
            disabled={notes.length === 0}
            title="导出所有笔记"
          >
            导出全部
          </button>
        </div>
      </div>

      {/* 分类区域 */}
      <div className="sections-container">
        <div className="sections-row">
          {/* 收藏笔记 */}
          <CollapsibleSection
            title="收藏"
            icon="⭐"
            count={favoriteNotes.length}
            isCollapsed={collapsedSections.favorite}
            onToggle={() => onToggleSection('favorite')}
          >
            {favoriteNotes.length === 0 ? (
              <div className="empty-section">还没有收藏笔记</div>
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
            title="全部"
            icon="📄"
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
                按时间
              </button>
              <button
                className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
                onClick={() => onSortChange('title')}
              >
                按标题
              </button>
            </div>

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
      </div>
    </aside>
  )
}
