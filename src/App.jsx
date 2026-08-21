import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import booksCsv from '../books.csv?raw'

const tiers = [
  { name: 'S', color: '#ff7f84' },
  { name: 'A', color: '#ffbc7d' },
  { name: 'B', color: '#ffdd85' },
  { name: 'C', color: '#ffff83' },
  { name: 'D', color: '#b5fa7b' },
  { name: 'F', color: '#7ee7a0' },
]

const storyTitles = new Set([
  'А зори здесь тихие. ..',
  'Великий дух и беглецы',
  'Вий',
  'Записки сумасшедшего',
  'Капитанская дочка. Повести',
  'Морфий.  Записки юного  врача',
  'Невский проспект',
  'Нос',
  'Портрет',
  'Скотный Двор',
  'Старик и море. Рассказы',
  'Судьба человека',
  'Тарас Бульба',
  'Шинель',
])

const unrankedTitles = new Set([
  'Sapiens. Краткая история человечества',
  'Вдохновленные. Все, что нужно знать продакт-менеджеру',
  'Великие русские художники',
  'Грокаем алгоритмы. Иллюстрированное пособие для программистов и любопытствующих',
  'Дурная кровь',
  'Искусство войны',
  'Кровь, пот и пиксели. Обратная сторона индустрии видеоигр',
  'Нажми Reset. Как игровая индустрия рушит карьеры и дает второй шанс',
  'От нуля к единице. Как создать стартап, который изменит будущее',
  'Серьезное творческое мышление',
  'Спроси маму. Как общаться с клиентами и подтвердить правоту своей бизнес-идеи, если все кругом врут?',
  'Уверенность в себе. Как повысить самооценку, преодолеть страхи и сомнения',
  'Чистый код. Создание, анализ и рефакторинг',
])

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

function getBookSection(book) {
  if (unrankedTitles.has(book.title)) return 'unranked'
  if (storyTitles.has(book.title)) return 'stories'
  return 'novels'
}

const initialBooks = parseCsv(booksCsv).map((book) => ({
  ...book,
  id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  tier: getInitialTier(book),
  section: getBookSection(book),
}))

async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Some browsers expose the API but deny it outside their preferred context.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  return copied
}

function BookCard({ book, onDragStart }) {
  const [copied, setCopied] = useState(false)
  const coverUrl = `${import.meta.env.BASE_URL}${book.cover.replace(/^\/+/, '')}`
  const year = book.year || 'Год не указан'
  const bookInfo = `${book.title}\n${book.author}\n${year}`

  async function copyBookInfo() {
    try {
      const copiedSuccessfully = await writeToClipboard(bookInfo)
      if (!copiedSuccessfully) return
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="book-card-shell">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <article
            className="book-card"
            draggable
            role="button"
            tabIndex={0}
            aria-label={`Скопировать информацию о книге «${book.title}»`}
            onClick={copyBookInfo}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                copyBookInfo()
              }
            }}
            onDragStart={(event) => onDragStart(event, book.id)}
          >
            <div className="book-cover-wrap">
              <img className="book-cover" src={coverUrl} alt={`Обложка книги «${book.title}»`} />
              <span className="book-rating" aria-label={`Моя оценка: ${book.user_rating || 'нет'}`}>
                {book.user_rating || '—'}
              </span>
            </div>
            <h2 className="book-title">{book.title}</h2>
            <p className="book-author">{book.author}</p>
            <p className="book-year">{year}</p>
          </article>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="book-tooltip" sideOffset={8}>
            <strong>{book.title}</strong>
            <span>{book.author}</span>
            <span>{year}</span>
            <small>Нажмите, чтобы скопировать</small>
            <Tooltip.Arrow className="book-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root open={copied}>
        <Tooltip.Trigger asChild>
          <span className="copy-tooltip-anchor" aria-hidden="true" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="copy-success-tooltip" side="top" sideOffset={7}>
            Скопировано
            <Tooltip.Arrow className="copy-success-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  )
}

function TierBoard({ books, onDragStart, onDrop }) {
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
              className="tier-content"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, tier.name)}
            >
              {tierBooks.map((book) => (
                <BookCard book={book} key={book.id} onDragStart={onDragStart} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function UnrankedShelf({ books, onDragStart }) {
  return (
    <section className="unranked-shelf" aria-label="Книги вне рейтинга">
      <header className="unranked-header">
        <h1>Вне рейтинга</h1>
        <span>{books.length} книг</span>
      </header>
      <div className="unranked-grid">
        {books.map((book) => (
          <BookCard book={book} key={book.id} onDragStart={onDragStart} />
        ))}
      </div>
    </section>
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
            <Tabs.List className="sub-tabs" aria-label="Категории книг">
              <Tabs.Trigger className="sub-tab" value="novels">Романы</Tabs.Trigger>
              <Tabs.Trigger className="sub-tab" value="stories">Рассказы</Tabs.Trigger>
              <Tabs.Trigger className="sub-tab" value="unranked">Вне рейтинга</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="novels">
              <TierBoard
                books={books.filter((book) => book.section === 'novels')}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            </Tabs.Content>
            <Tabs.Content value="stories">
              <TierBoard
                books={books.filter((book) => book.section === 'stories')}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            </Tabs.Content>
            <Tabs.Content value="unranked">
              <UnrankedShelf
                books={books.filter((book) => book.section === 'unranked')}
                onDragStart={handleDragStart}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Tooltip.Provider>
  )
}
