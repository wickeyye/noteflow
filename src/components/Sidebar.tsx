import type { Note } from '../types/index'
import { CompactNoteItem } from './CompactNoteItem'

type SortOption = 'time' | 'title'

interface SidebarProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  sortBy: SortOption
  activeTab: 'favorite' | 'all'
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  onSearchChange: (query: string) => void
  onSortChange: (sortBy: SortOption) => void
  onNoteSelect: (note: Note) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: number, e: React.MouseEvent) => void
  onToggleFavorite: (noteId: number) => void
  onTabChange: (tab: 'favorite' | 'all') => void
}

export function Sidebar({
  notes,
  selectedNote,
  searchQuery,
  sortBy,
  activeTab,
  searchInputRef,
  onSearchChange,
  onSortChange,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onToggleFavorite,
  onTabChange
}: SidebarProps) {
  // 筛选收藏笔记
  const getFavoriteNotes = () => {
    return notes
      .filter(note => note.isFavorite)
      .filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'time') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        } else {
          return a.title.localeCompare(b.title)
        }
      })
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
  const displayNotes = activeTab === 'favorite' ? favoriteNotes : allNotes

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
        </div>
      </div>

      {/* 分类区域 */}
      <div className="sections-container">
        {/* 分类标签行 */}
        <div className="sections-tabs-row">
          <button
            className={`section-tab ${activeTab === 'favorite' ? 'active' : ''}`}
            onClick={() => onTabChange('favorite')}
          >
            <span className="section-icon">⭐</span>
            <span className="section-title">收藏</span>
            <span className="section-count">({favoriteNotes.length})</span>
          </button>
          <button
            className={`section-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            <span className="section-icon">📄</span>
            <span className="section-title">全部</span>
            <span className="section-count">({allNotes.length})</span>
          </button>
        </div>

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
        <div className="notes-list">
          {displayNotes.length === 0 ? (
            <div className="empty-section">
              {activeTab === 'favorite'
                ? '还没有收藏笔记'
                : (searchQuery ? '没有找到匹配的笔记' : '还没有笔记')}
            </div>
          ) : (
            displayNotes.map(note => (
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
        </div>
      </div>
    </aside>
  )
}
