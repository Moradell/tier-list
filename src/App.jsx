import { useState } from 'react'
import booksCsv from '../books.csv?raw'

const tiers = [
  { name: 'S', color: '#ff7f84' },
  { name: 'A', color: '#ffbc7d' },
  { name: 'B', color: '#ffdd85' },
  { name: 'C', color: '#ffff83' },
  { name: 'D', color: '#b5fa7b' },
  { name: 'F', color: '#7ee7a0' },
]

function parseCsv(csv) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]

    if (quoted && character === '"' && csv[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...data] = rows
  return data.map((values) => Object.fromEntries(
    header.map((column, index) => [column.replace(/^\uFEFF/, ''), values[index] ?? '']),
  ))
}

function getInitialTier(book) {
  if (book.favorite === 'true') return 'S'

  const rating = Number(book.user_rating.replace(',', '.'))
  if (!Number.isFinite(rating)) return 'F'
  if (rating >= 4.5) return 'A'
  if (rating >= 3.5) return 'B'
  if (rating >= 3) return 'C'
  if (rating >= 2) return 'D'
  return 'F'
}

const initialBooks = parseCsv(booksCsv).map((book) => ({
  ...book,
  id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  tier: getInitialTier(book),
}))

function BookCard({ book, onDragStart }) {
  const coverUrl = `${import.meta.env.BASE_URL}${book.cover.replace(/^\/+/, '')}`

  return (
    <article
      className="book-card"
      draggable
      onDragStart={(event) => onDragStart(event, book.id)}
      title={`${book.title} — ${book.author}`}
    >
      <div className="book-cover-wrap">
        <img className="book-cover" src={coverUrl} alt={`Обложка книги «${book.title}»`} />
        <span className="book-rating" aria-label={`Моя оценка: ${book.user_rating || 'нет'}`}>
          {book.user_rating || '—'}
        </span>
      </div>
      <h2 className="book-title">{book.title}</h2>
      <p className="book-year">{book.year || 'Год не указан'}</p>
    </article>
  )
}

export default function App() {
  const [books, setBooks] = useState(initialBooks)
  const [draggedBookId, setDraggedBookId] = useState(null)

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
    <main className="tier-list" aria-label="Полотно тир-листа">
      {tiers.map((tier) => {
        const tierBooks = books.filter((book) => book.tier === tier.name)

        return (
          <section className="tier-row" key={tier.name} aria-label={`Уровень ${tier.name}`}>
            <div className="tier-label" style={{ backgroundColor: tier.color }}>
              <span>{tier.name}</span>
              <small>{tierBooks.length}</small>
            </div>
            <div
              className="tier-content"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, tier.name)}
            >
              {tierBooks.map((book) => (
                <BookCard book={book} key={book.id} onDragStart={handleDragStart} />
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
