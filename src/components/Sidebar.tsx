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
        {/* 分类标题行 */}
        <div className="sections-headers-row">
          <div
            className="section-header-item"
            onClick={() => onToggleSection('favorite')}
          >
            <span className="section-arrow">{collapsedSections.favorite ? '▶' : '▼'}</span>
            <span className="section-icon">⭐</span>
            <span className="section-title">收藏</span>
            <span className="section-count">({favoriteNotes.length})</span>
          </div>
          <div
            className="section-header-item"
            onClick={() => onToggleSection('all')}
          >
            <span className="section-arrow">{collapsedSections.all ? '▶' : '▼'}</span>
            <span className="section-icon">📄</span>
            <span className="section-title">全部</span>
            <span className="section-count">({allNotes.length})</span>
          </div>
        </div>

        {/* 收藏笔记内容 */}
        <div className={`section-content ${collapsedSections.favorite ? 'collapsed' : 'expanded'}`}>
          {favoriteNotes.length === 0 ? (
            <div className="empty-section">还没有收藏笔记</div>
          ) : (
            <div className="notes-list">
              {favoriteNotes.map(note => (
                <CompactNoteItem
                  key={note.id}
                  note={note}
                  isActive={selectedNote?.id === note.id}
                  onSelect={() => onNoteSelect(note)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  onDelete={(e) => onNoteDelete(note.id, e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 全部笔记内容 */}
        <div className={`section-content ${collapsedSections.all ? 'collapsed' : 'expanded'}`}>
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
            <div className="notes-list">
              {allNotes.map(note => (
                <CompactNoteItem
                  key={note.id}
                  note={note}
                  isActive={selectedNote?.id === note.id}
                  onSelect={() => onNoteSelect(note)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  onDelete={(e) => onNoteDelete(note.id, e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
