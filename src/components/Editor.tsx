import { Note } from '../types'

interface EditorProps {
  note: Note | null
  notesCount: number
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
}

export function Editor({ note, notesCount, onTitleChange, onContentChange }: EditorProps) {
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
      <input
        type="text"
        className="note-title-input"
        value={note.title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="笔记标题"
      />
      <textarea
        className="note-editor"
        value={note.content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="开始写笔记..."
      />
    </main>
  )
}
