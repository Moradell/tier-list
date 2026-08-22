import { Tooltip } from '@components/Tooltip'
import type { Book, BookDragEndHandler, BookDragOverHandler, BookDragStartHandler } from '@/types/book'
import { formatReadDate } from '@utils/formatReadDate'
import './BookCard.scss'

interface BookCardProps {
  book: Book
  fullMode: boolean
  isDragging: boolean
  onDragEnd: BookDragEndHandler
  onDragOverBook: BookDragOverHandler
  onDragStart: BookDragStartHandler
}

export function BookCard({
  book,
  fullMode,
  isDragging,
  onDragEnd,
  onDragOverBook,
  onDragStart,
}: BookCardProps) {
  const coverUrl = `${import.meta.env.BASE_URL}${book.cover.replace(/^\/+/, '')}`
  const publicationYear = book.year || 'Год не указан'
  const readDate = formatReadDate(book.read_date)

  return (
    <div
      className={`book-card-shell${fullMode ? ' book-card-shell-full' : ''}${isDragging ? ' book-card-shell-dragging' : ''}`}
      onDragOver={(event) => onDragOverBook(event, book.id)}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDragEnd()
      }}
    >
      <Tooltip
        contentClassName="book-tooltip"
        arrowClassName="book-tooltip-arrow"
        trigger={(
          <a
            className={`book-card${fullMode ? ' book-card-full' : ''}`}
            href={book.url}
            target="_blank"
            rel="noreferrer"
            draggable
            aria-label={`Открыть книгу «${book.title}» на LiveLib`}
            onDragStart={(event) => onDragStart(event, book.id)}
            onDragEnd={onDragEnd}
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
              {fullMode ? (
                <>
                  <p className="book-meta">Прочитано: {readDate}</p>
                  <p className="book-meta">Рейтинг LiveLib: {book.livelib_rating}</p>
                </>
              ) : (
                <p className="book-year">{publicationYear}</p>
              )}
            </div>
          </a>
        )}
      >
        <>
            <strong>{book.title}</strong>
            <span>{book.author}</span>
            <span>Опубликовано: {publicationYear}</span>
            <span>Прочитано: {readDate}</span>
            <small>Нажмите, чтобы открыть книгу на LiveLib</small>
        </>
      </Tooltip>
    </div>
  )
}
