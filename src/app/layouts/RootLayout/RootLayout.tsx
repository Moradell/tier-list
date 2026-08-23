import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import { BookHistoryDrawer, useBookHistory } from '@features/book-history'
import { MovieHistoryDrawer, useMovieHistory } from '@features/movie-history'
import './RootLayout.scss'

const sections: TabItem[] = [
  { label: 'Книги', to: '/books' },
  { label: 'Фильмы', to: '/movies' },
]

export function RootLayout() {
  const bookHistory = useBookHistory()
  const movieHistory = useMovieHistory()
  const { pathname } = useLocation()
  const isMoviesSection = pathname.startsWith('/movies')
  const activeHistory = isMoviesSection ? movieHistory : bookHistory
  const statisticsReturnPath = pathname.startsWith('/books/') && pathname !== '/books/stats'
    ? pathname
    : '/books/novels'

  return (
    <>
      <header className="app-nav">
        <Tabs ariaLabel="Разделы" items={sections} />
        <div className="app-nav-actions">
          {!isMoviesSection && (
            <NavLink
              className={({ isActive }) => `statistics-trigger${isActive ? ' statistics-trigger--active' : ''}`}
              state={{ returnTo: statisticsReturnPath }}
              to="/books/stats"
            >
              Статистика
            </NavLink>
          )}
          <button className="history-trigger" type="button" onClick={activeHistory.openHistory}>
            История
            {activeHistory.events.length > 0 && <span>{activeHistory.events.length}</span>}
          </button>
        </div>
      </header>
      <Outlet />
      {isMoviesSection ? <MovieHistoryDrawer /> : <BookHistoryDrawer />}
    </>
  )
}
