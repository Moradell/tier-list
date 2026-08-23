import { NavLink } from 'react-router-dom'
import './Tabs.scss'

export interface TabItem {
  count?: number
  label: string
  to: string
}

interface TabsProps {
  ariaLabel: string
  items: TabItem[]
  level?: 'primary' | 'secondary'
}

export function Tabs({ ariaLabel, items, level = 'primary' }: TabsProps) {
  const listClassName = level === 'primary' ? 'top-tabs' : 'sub-tabs'
  const tabClassName = level === 'primary' ? 'top-tab' : 'sub-tab'

  return (
    <nav className={listClassName} aria-label={ariaLabel}>
      {items.map((item) => (
        <NavLink
          className={({ isActive }) => `${tabClassName}${isActive ? ' tab-active' : ''}`}
          key={item.to}
          to={item.to}
        >
          <span>{item.label}</span>
          {item.count !== undefined && (
            <span className="tab-count">{item.count.toLocaleString('ru-RU')}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
