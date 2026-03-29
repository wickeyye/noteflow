import { useState } from 'react'
import type { Note } from '../types/index'

interface EditorProps {
  note: Note | null
  notesCount: number
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onTagsChange: (tags: string[]) => void
}

export function Editor({ note, notesCount, onTitleChange, onContentChange, onTagsChange }: EditorProps) {
  const [fontSize, setFontSize] = useState(17)
  const [textColor, setTextColor] = useState('#f5f5f5')

  if (!note) {
    return (
      <main className="editor-area">
        <div className="empty-state">
          <p>
            {notesCount === 0
              ? '📝 还没有笔记，点击左侧"新建笔记"开始'
              : '👈 选择一条笔记开始编辑'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="editor-area">
      <div className="editor-header">
        <div className="editor-top-bar">
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <label className="toolbar-label">字号</label>
              <button
                className="toolbar-btn"
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                title="减小字号"
              >
                A-
              </button>
              <span className="font-size-display">{fontSize}</span>
              <button
                className="toolbar-btn"
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                title="增大字号"
              >
                A+
              </button>
            </div>
            <div className="toolbar-group">
              <label className="toolbar-label">颜色</label>
              <input
                type="color"
                className="color-picker"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                title="选择文字颜色"
              />
            </div>
          </div>
          <span className="note-date-compact">📅 {note.updatedAt}</span>
        </div>
        <input
          type="text"
          className="note-title-input"
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="笔记标题"
        />
      </div>

      <textarea
        className="note-editor"
        value={note.content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="开始写笔记..."
        style={{ fontSize: `${fontSize}px`, color: textColor }}
      />
    </main>
  )
}
