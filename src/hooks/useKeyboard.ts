import { useEffect } from 'react'

interface KeyboardHandlers {
  onNew?: () => void
  onSave?: () => void
  onSearch?: () => void
  onDelete?: () => void
}

export function useKeyboard(handlers: KeyboardHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + N: 新建笔记
      if (modifier && e.key === 'n') {
        e.preventDefault()
        handlers.onNew?.()
      }

      // Ctrl/Cmd + S: 保存提示
      if (modifier && e.key === 's') {
        e.preventDefault()
        handlers.onSave?.()
      }

      // Ctrl/Cmd + F: 聚焦搜索框
      if (modifier && e.key === 'f') {
        e.preventDefault()
        handlers.onSearch?.()
      }

      // Ctrl/Cmd + Delete: 删除当前笔记
      if (modifier && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        handlers.onDelete?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
