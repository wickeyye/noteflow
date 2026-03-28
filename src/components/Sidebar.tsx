import type { Note } from '../types/index'

type SortOption = 'time' | 'title'

interface SidebarProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  selectedTag: string | null
  sortBy: SortOption
  searchInputRef?: React.RefObject<HTMLInputElement>
  onSearchChange: (query: string) => void
  onTagSelect: (tag: string | null) => void
  onSortChange: (sortBy: SortOption) => void
  onNoteSelect: (note: Note) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: number, e: React.MouseEvent) => void
}

export function Sidebar({
  notes,
  selectedNote,
  searchQuery,
  selectedTag,
  sortBy,
  searchInputRef,
  onSearchChange,
  onTagSelect,
  onSortChange,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete
}: SidebarProps) {
  // 收集所有标签
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  ).sort()

  // 筛选笔记
  const filteredNotes = notes
    .filter(note => {
      // 搜索筛选
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())

      // 标签筛选
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
      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-list">
            <p>{searchQuery ? '没有找到匹配的笔记' : '还没有笔记，点击上方按钮创建'}</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => onNoteSelect(note)}
            >
              <div className="note-item-content">
                <h3 className="note-title">{note.title}</h3>
                <p className="note-preview">{note.content.substring(0, 50)}...</p>
                <span className="note-date">{note.updatedAt}</span>
              </div>
              <button
                className="btn-delete"
                onClick={(e) => onNoteDelete(note.id, e)}
                title="删除笔记"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
