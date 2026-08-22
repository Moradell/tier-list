import type { DragEvent } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { BookCard } from '@components/BookCard'
import { TierList } from '@components/TierList'
import { Tooltip } from '@components/Tooltip'
import type { BookTier } from '@lib/books'
import type { Book, BookCategory, BookDragStartHandler } from '@/types/book'
import '@/App.scss'

interface TabsProps {
  books: Book[]
  fullMode: boolean
  onFullModeChange: (fullMode: boolean) => void
  onDragStart: BookDragStartHandler
  onDrop: (event: DragEvent<HTMLDivElement>, tier: BookTier) => void
}

interface UnrankedShelfProps {
  books: Book[]
  fullMode: boolean
  onDragStart: BookDragStartHandler
}

function UnrankedShelf({ books, fullMode, onDragStart }: UnrankedShelfProps) {
  return (
    <section className="unranked-shelf" aria-label="Книги вне рейтинга">
      <header className="unranked-header">
        <h1>Вне рейтинга</h1>
        <span>{books.length} книг</span>
      </header>
      <div className={`unranked-grid${fullMode ? ' unranked-grid-full' : ''}`}>
        {books.map((book) => (
          <BookCard book={book} fullMode={fullMode} key={book.id} onDragStart={onDragStart} />
        ))}
      </div>
    </section>
  )
}

export function Tabs({ books, fullMode, onFullModeChange, onDragStart, onDrop }: TabsProps) {
  const booksByCategory = (category: BookCategory) => books.filter((book) => book.category === category)

  return (
    <RadixTabs.Root className="app-tabs" defaultValue="books">
      <header className="app-nav">
        <RadixTabs.List className="top-tabs" aria-label="Разделы">
          <RadixTabs.Trigger className="top-tab" value="books">Книги</RadixTabs.Trigger>
          <Tooltip
            trigger={(
              <span className="disabled-tab-wrap" tabIndex={0}>
                <button className="top-tab top-tab-disabled" type="button" disabled>Фильмы</button>
              </span>
            )}
          >
            Coming soon
          </Tooltip>
        </RadixTabs.List>
      </header>

      <RadixTabs.Content value="books">
        <RadixTabs.Root className="book-tabs" defaultValue="novels">
          <div className="book-tabs-toolbar">
            <RadixTabs.List className="sub-tabs" aria-label="Категории книг">
              <RadixTabs.Trigger className="sub-tab" value="novels">Романы</RadixTabs.Trigger>
              <RadixTabs.Trigger className="sub-tab" value="stories">Рассказы</RadixTabs.Trigger>
              <RadixTabs.Trigger className="sub-tab" value="manga">Манга</RadixTabs.Trigger>
              <RadixTabs.Trigger className="sub-tab" value="unranked">Вне рейтинга</RadixTabs.Trigger>
            </RadixTabs.List>
            <button
              className="mode-toggle"
              type="button"
              aria-pressed={fullMode}
              onClick={() => onFullModeChange(!fullMode)}
            >
              <span className="mode-toggle-track" aria-hidden="true"><span className="mode-toggle-thumb" /></span>
              Полный режим
            </button>
          </div>

          <RadixTabs.Content value="novels">
            <TierList books={booksByCategory('Роман')} fullMode={fullMode} onDragStart={onDragStart} onDrop={onDrop} />
          </RadixTabs.Content>
          <RadixTabs.Content value="stories">
            <TierList books={booksByCategory('Рассказ')} fullMode={fullMode} onDragStart={onDragStart} onDrop={onDrop} />
          </RadixTabs.Content>
          <RadixTabs.Content value="manga">
            <TierList books={booksByCategory('Манга')} fullMode={fullMode} onDragStart={onDragStart} onDrop={onDrop} />
          </RadixTabs.Content>
          <RadixTabs.Content value="unranked">
            <UnrankedShelf books={booksByCategory('Вне рейтинга')} fullMode={fullMode} onDragStart={onDragStart} />
          </RadixTabs.Content>
        </RadixTabs.Root>
      </RadixTabs.Content>
    </RadixTabs.Root>
  )
}
