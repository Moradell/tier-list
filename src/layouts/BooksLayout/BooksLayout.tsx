import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Tabs, type TabItem } from '@components/Tabs'
import { initialBooks } from '@/data/books'
import { useBookDnd } from '@/dnd'
import type { BooksOutletContext } from '@/types/booksOutlet'
import './BooksLayout.scss'

const bookSections: TabItem[] = [
  { label: 'Романы', to: '/books/novels' },
  { label: 'Рассказы', to: '/books/stories' },
  { label: 'Манга', to: '/books/manga' },
  { label: 'Вне рейтинга', to: '/books/unranked' },
]

export function BooksLayout() {
  const [fullMode, setFullMode] = useState(false)
  const dnd = useBookDnd(initialBooks)
  const outletContext: BooksOutletContext = {
    books: dnd.books,
    dndEnabled: dnd.dndEnabled,
    draggedBookId: dnd.draggedBookId,
    fullMode,
    onDragEnd: dnd.handleDragEnd,
    onDragOverBook: dnd.handleDragOverBook,
    onDragStart: dnd.handleDragStart,
    onDrop: dnd.handleDrop,
    onDropBook: dnd.handleDropBook,
  }

  return (
    <>
      <div className="book-tabs-toolbar">
        <Tabs ariaLabel="Категории книг" items={bookSections} level="secondary" />
        <button
          className="mode-toggle"
          type="button"
          aria-pressed={fullMode}
          onClick={() => setFullMode((currentMode) => !currentMode)}
        >
          <span className="mode-toggle-track" aria-hidden="true"><span className="mode-toggle-thumb" /></span>
          Полный режим
        </button>
      </div>
      <Outlet context={outletContext} />
    </>
  )
}
