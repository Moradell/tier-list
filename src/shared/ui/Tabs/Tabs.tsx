import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import './Tabs.scss'

export interface TabItem {
  count?: number
  icon?: ReactNode
  iconOnlyOnMobile?: boolean
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
          aria-label={item.iconOnlyOnMobile ? item.label : undefined}
        >
          {item.icon && <span className="tab-icon" aria-hidden="true">{item.icon}</span>}
          <span className={item.iconOnlyOnMobile ? 'tab-label tab-label--mobile-hidden' : 'tab-label'}>
            {item.label}
          </span>
          {item.count !== undefined && (
            <span className="tab-count">{item.count.toLocaleString('ru-RU')}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
