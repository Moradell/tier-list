import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import novelsCsv from '../data/novels.csv?raw'
import storiesCsv from '../data/stories.csv?raw'
import mangaCsv from '../data/manga.csv?raw'
import unrankedCsv from '../data/unranked.csv?raw'
import { parseBooksCsv } from './lib/books'

const tiers = [
  { name: 'S', color: '#ff7f84' },
  { name: 'A', color: '#ffbc7d' },
  { name: 'B', color: '#ffdd85' },
  { name: 'C', color: '#ffff83' },
  { name: 'D', color: '#b5fa7b' },
  { name: 'F', color: '#7ee7a0' },
]

function prepareBooks(csv, category, sourceName) {
  return parseBooksCsv(csv, sourceName).map((book) => ({
    ...book,
    category,
    id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  }))
}

const initialBooks = [
  ...prepareBooks(novelsCsv, 'Роман', 'data/novels.csv'),
  ...prepareBooks(storiesCsv, 'Рассказ', 'data/stories.csv'),
  ...prepareBooks(mangaCsv, 'Манга', 'data/manga.csv'),
  ...prepareBooks(unrankedCsv, 'Вне рейтинга', 'data/unranked.csv'),
]

function formatReadDate(readDate) {
  const match = readDate?.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) return readDate === '-' ? '—' : 'Дата чтения не указана'

  const [, year, month, day] = match
  return day ? `${day}.${month}.${year}` : `${month}.${year}`
}

function BookCard({ book, fullMode, onDragStart }) {
  const coverUrl = `${import.meta.env.BASE_URL}${book.cover.replace(/^\/+/, '')}`
  const publicationYear = book.year || 'Год не указан'
  const readDate = formatReadDate(book.read_date)

  return (
    <div className={`book-card-shell${fullMode ? ' book-card-shell-full' : ''}`}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a
            className={`book-card${fullMode ? ' book-card-full' : ''}`}
            href={book.url}
            target="_blank"
            rel="noreferrer"
            draggable
            aria-label={`Открыть книгу «${book.title}» на LiveLib`}
            onDragStart={(event) => onDragStart(event, book.id)}
          >
            <div className="book-cover-wrap">
              <img className="book-cover" src={coverUrl} alt={`Обложка книги «${book.title}»`} />
              <span className="book-rating" aria-label={`Моя оценка: ${book.user_rating || 'нет'}`}>
                {book.user_rating || '—'}
              </span>
            </div>
            <div className="book-details">
              <h2 className="book-title">{book.title}</h2>
              <p className="book-author">{book.author}</p>
              {fullMode && <p className="book-meta">Год публикации: {publicationYear}</p>}
              {fullMode
                ? <>
                    <p className="book-meta">Прочитано: {readDate}</p>
                    <p className="book-meta">Рейтинг LiveLib: {book.livelib_rating}</p>
                  </>
                : <p className="book-year">{publicationYear}</p>}
            </div>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="book-tooltip" sideOffset={8}>
            <strong>{book.title}</strong>
            <span>{book.author}</span>
            <span>Опубликовано: {publicationYear}</span>
            <span>Прочитано: {readDate}</span>
            <small>Нажмите, чтобы открыть книгу на LiveLib</small>
            <Tooltip.Arrow className="book-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

    </div>
  )
}

function TierBoard({ books, fullMode, onDragStart, onDrop }) {
  return (
    <div className="tier-list" aria-label="Полотно тир-листа">
      {tiers.map((tier) => {
        const tierBooks = books.filter((book) => book.tier === tier.name)

        return (
          <section className="tier-row" key={tier.name} aria-label={`Уровень ${tier.name}`}>
            <div className="tier-label" style={{ backgroundColor: tier.color }}>
              <span>{tier.name}</span>
              <small>{tierBooks.length}</small>
            </div>
            <div
              className={`tier-content${fullMode ? ' tier-content-full' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, tier.name)}
            >
              {tierBooks.map((book) => (
                <BookCard book={book} fullMode={fullMode} key={book.id} onDragStart={onDragStart} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function UnrankedShelf({ books, fullMode, onDragStart }) {
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

export default function App() {
  const [books, setBooks] = useState(initialBooks)
  const [draggedBookId, setDraggedBookId] = useState(null)
  const [fullMode, setFullMode] = useState(false)

  function handleDragStart(event, bookId) {
    setDraggedBookId(bookId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', bookId)
  }

  function handleDrop(event, tierName) {
    event.preventDefault()
    const bookId = event.dataTransfer.getData('text/plain') || draggedBookId
    setBooks((currentBooks) => currentBooks.map((book) => (
      book.id === bookId ? { ...book, tier: tierName } : book
    )))
    setDraggedBookId(null)
  }

  return (
    <Tooltip.Provider delayDuration={250}>
      <Tabs.Root className="app-tabs" defaultValue="books">
        <header className="app-nav">
          <Tabs.List className="top-tabs" aria-label="Разделы">
            <Tabs.Trigger className="top-tab" value="books">Книги</Tabs.Trigger>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="disabled-tab-wrap" tabIndex={0}>
                  <button className="top-tab top-tab-disabled" type="button" disabled>
                    Фильмы
                  </button>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="tooltip-content" sideOffset={8}>
                  Coming soon
                  <Tooltip.Arrow className="tooltip-arrow" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tabs.List>
        </header>

        <Tabs.Content value="books">
          <Tabs.Root className="book-tabs" defaultValue="novels">
            <div className="book-tabs-toolbar">
              <Tabs.List className="sub-tabs" aria-label="Категории книг">
                <Tabs.Trigger className="sub-tab" value="novels">Романы</Tabs.Trigger>
                <Tabs.Trigger className="sub-tab" value="stories">Рассказы</Tabs.Trigger>
                <Tabs.Trigger className="sub-tab" value="manga">Манга</Tabs.Trigger>
                <Tabs.Trigger className="sub-tab" value="unranked">Вне рейтинга</Tabs.Trigger>
              </Tabs.List>
              <button
                className="mode-toggle"
                type="button"
                aria-pressed={fullMode}
                onClick={() => setFullMode((currentMode) => !currentMode)}
              >
                <span className="mode-toggle-track" aria-hidden="true">
                  <span className="mode-toggle-thumb" />
                </span>
                Полный режим
              </button>
            </div>

            <Tabs.Content value="novels">
              <TierBoard
                books={books.filter((book) => book.category === 'Роман')}
                fullMode={fullMode}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            </Tabs.Content>
            <Tabs.Content value="stories">
              <TierBoard
                books={books.filter((book) => book.category === 'Рассказ')}
                fullMode={fullMode}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            </Tabs.Content>
            <Tabs.Content value="manga">
              <TierBoard
                books={books.filter((book) => book.category === 'Манга')}
                fullMode={fullMode}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            </Tabs.Content>
            <Tabs.Content value="unranked">
              <UnrankedShelf
                books={books.filter((book) => book.category === 'Вне рейтинга')}
                fullMode={fullMode}
                onDragStart={handleDragStart}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Tooltip.Provider>
  )
}
