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
