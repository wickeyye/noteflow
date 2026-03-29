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
