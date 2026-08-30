import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Clapperboard, Menu, X, Zap } from 'lucide-react'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import { BookHistoryDrawer, useBookHistory } from '@features/book-history'
import { MovieHistoryDrawer, useMovieHistory } from '@features/movie-history'
import './RootLayout.scss'

const sections: TabItem[] = [
  { icon: <BookOpen />, iconOnlyOnMobile: true, label: 'Книги', to: '/books' },
  { icon: <Clapperboard />, iconOnlyOnMobile: true, label: 'Фильмы', to: '/movies' },
  { icon: <Zap />, iconOnlyOnMobile: true, label: 'Энергетики', to: '/energy-drinks' },
]

export function RootLayout() {
  const bookHistory = useBookHistory()
  const movieHistory = useMovieHistory()
  const { pathname } = useLocation()
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false)
  const isMoviesSection = pathname.startsWith('/movies')
  const isEnergyDrinksSection = pathname.startsWith('/energy-drinks')
  const activeHistory = isMoviesSection ? movieHistory : bookHistory
  const statisticsPath = isMoviesSection ? '/movies/stats' : '/books/stats'
  const statisticsReturnPath = isMoviesSection
    ? pathname.startsWith('/movies/') && pathname !== '/movies/stats'
      ? pathname
      : '/movies/films'
    : pathname.startsWith('/books/') && pathname !== '/books/stats'
      ? pathname
      : '/books/novels'

  useEffect(() => setIsSectionMenuOpen(false), [pathname])

  return (
    <>
      <header className="app-nav">
        <div className="app-section-menu">
          <button
            className="app-section-menu__trigger"
            type="button"
            aria-label={isSectionMenuOpen ? 'Закрыть меню разделов' : 'Открыть меню разделов'}
            aria-expanded={isSectionMenuOpen}
            onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
          >
            {isSectionMenuOpen ? <X /> : <Menu />}
          </button>
          <div className={`app-section-menu__panel${isSectionMenuOpen ? ' app-section-menu__panel--open' : ''}`}>
            <Tabs ariaLabel="Разделы" items={sections} />
          </div>
        </div>
        {!isEnergyDrinksSection && <div className="app-nav-actions">
          <NavLink
            className={({ isActive }) => `statistics-trigger${isActive ? ' statistics-trigger--active' : ''}`}
            state={{ returnTo: statisticsReturnPath }}
            to={statisticsPath}
          >
            Статистика
          </NavLink>
          <button className="history-trigger" type="button" onClick={activeHistory.openHistory}>
            История
            {activeHistory.events.length > 0 && <span>{activeHistory.events.length}</span>}
          </button>
        </div>}
      </header>
      <Outlet />
      {!isEnergyDrinksSection && (isMoviesSection ? <MovieHistoryDrawer /> : <BookHistoryDrawer />)}
    </>
  )
}
