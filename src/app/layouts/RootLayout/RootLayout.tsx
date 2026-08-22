import { Outlet } from 'react-router-dom'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import { HistoryDrawer, useHistory } from '@features/history'
import './RootLayout.scss'

const sections: TabItem[] = [
  { label: 'Книги', to: '/books' },
  { label: 'Фильмы', to: '/movies' },
]

export function RootLayout() {
  const { events, openHistory } = useHistory()

  return (
    <>
      <header className="app-nav">
        <Tabs ariaLabel="Разделы" items={sections} />
        <button className="history-trigger" type="button" onClick={openHistory}>
          История
          {events.length > 0 && <span>{events.length}</span>}
        </button>
      </header>
      <Outlet />
      <HistoryDrawer />
    </>
  )
}
