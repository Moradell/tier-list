import { Outlet } from 'react-router-dom'
import { Tabs, type TabItem } from '@components/Tabs'
import './RootLayout.scss'

const sections: TabItem[] = [
  { label: 'Книги', to: '/books' },
  { label: 'Фильмы', to: '/movies' },
]

export function RootLayout() {
  return (
    <>
      <header className="app-nav">
        <Tabs ariaLabel="Разделы" items={sections} />
      </header>
      <Outlet />
    </>
  )
}
