import { useState } from 'react'
import type { Note } from '../types/index'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface EditorProps {
  note: Note | null
  notesCount: number
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onTagsChange: (tags: string[]) => void
}

export function Editor({ note, notesCount, onTitleChange, onContentChange, onTagsChange }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (!note || !tagInput.trim()) return
    const newTag = tagInput.trim()
    const currentTags = note.tags || []
    if (!currentTags.includes(newTag)) {
      onTagsChange([...currentTags, newTag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (!note) return
    const currentTags = note.tags || []
    onTagsChange(currentTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

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
        <input
          type="text"
          className="note-title-input"
          value={note.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="笔记标题"
        />
        <div className="editor-info">
          <span className="char-count">📊 {note.content.length} 字符</span>
          <span className="note-date">📅 更新于 {note.updatedAt}</span>
        </div>
        <div className="editor-toolbar">
          <button
            className={`btn-mode ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
          >
            ✏️ 编辑
          </button>
          <button
            className={`btn-mode ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
          >
            👁️ 预览
          </button>
        </div>
      </div>

      <div className="tags-section">
        <div className="tags-list">
          {(note.tags || []).map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button
                className="tag-remove"
                onClick={() => handleRemoveTag(tag)}
                title="删除标签"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="tag-input-wrapper">
          <input
            type="text"
            className="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="添加标签（按 Enter）"
          />
          <button className="btn-add-tag" onClick={handleAddTag}>
            + 添加
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="note-editor"
          value={note.content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="开始写笔记... 支持 Markdown 格式"
        />
      )}
    </main>
  )
}
