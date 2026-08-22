import { Outlet } from 'react-router-dom'
import { Tabs, type TabItem } from '@components/Tabs'
import { useBooks } from '@/providers/BooksProvider'
import type { BooksOutletContext } from '@/types/booksOutlet'
import './BooksLayout.scss'

const bookSections: TabItem[] = [
  { label: 'Романы', to: '/books/novels' },
  { label: 'Рассказы', to: '/books/stories' },
  { label: 'Манга', to: '/books/manga' },
  { label: 'Вне рейтинга', to: '/books/unranked' },
]

export function BooksLayout() {
  const booksContext = useBooks()
  const { setFullMode, ...outletContext } = booksContext
  const context: BooksOutletContext = outletContext

  return (
    <>
      <div className="book-tabs-toolbar">
        <Tabs ariaLabel="Категории книг" items={bookSections} level="secondary" />
        <button
          className="mode-toggle"
          type="button"
          aria-pressed={context.fullMode}
          onClick={() => setFullMode(!context.fullMode)}
        >
          <span className="mode-toggle-track" aria-hidden="true"><span className="mode-toggle-thumb" /></span>
          Полный режим
        </button>
      </div>
      <Outlet context={context} />
    </>
  )
}
