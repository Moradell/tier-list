import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import { HistoryDrawer, useHistory } from '@features/history'
import './RootLayout.scss'

const sections: TabItem[] = [
  { label: 'Книги', to: '/books' },
  { label: 'Фильмы', to: '/movies' },
]

export function RootLayout() {
  const { events, openHistory } = useHistory()
  const { pathname } = useLocation()
  const statisticsPath = pathname.startsWith('/movies') ? '/movies/stats' : '/books/stats'
  const statisticsReturnPath = pathname.startsWith('/movies')
    ? '/movies'
    : pathname.startsWith('/books/') && pathname !== '/books/stats'
      ? pathname
      : '/books/novels'

  return (
    <>
      <header className="app-nav">
        <Tabs ariaLabel="Разделы" items={sections} />
        <div className="app-nav-actions">
          <NavLink
            className={({ isActive }) => `statistics-trigger${isActive ? ' statistics-trigger--active' : ''}`}
            state={{ returnTo: statisticsReturnPath }}
            to={statisticsPath}
          >
            Статистика
          </NavLink>
          <button className="history-trigger" type="button" onClick={openHistory}>
            История
            {events.length > 0 && <span>{events.length}</span>}
          </button>
        </div>
      </header>
      <Outlet />
      <HistoryDrawer />
    </>
  )
}
