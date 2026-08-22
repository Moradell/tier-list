import { useRef, useState, type DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type { Book, BookCategory, BookDragOverHandler, BookDragStartHandler } from '@/types/book'
import { persistBookOrder } from './persistBookOrder'

export const DND_ENABLED = import.meta.env.DEV

function recalculatePositions(books: Book[], category: BookCategory): Book[] {
  const tierPositions = new Map<BookTier, number>()
  let unrankedPosition = 0

  return books.map((book) => {
    if (book.category !== category) return book

    const position = category === 'Вне рейтинга'
      ? ++unrankedPosition
      : (tierPositions.get(book.tier) ?? 0) + 1
    tierPositions.set(book.tier, position)

    return book.position === String(position) ? book : { ...book, position: String(position) }
  })
}

export function useBookDnd(initialBooks: Book[]) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null)
  const booksRef = useRef(books)
  const dragStartBooksRef = useRef<Book[] | null>(null)
  const dropHandledRef = useRef(false)

  function updateBooks(nextBooks: Book[]) {
    booksRef.current = nextBooks
    setBooks(nextBooks)
  }

  function commitOrder(category: BookCategory) {
    const rollbackBooks = dragStartBooksRef.current
    const nextBooks = recalculatePositions(booksRef.current, category)
    dropHandledRef.current = true
    updateBooks(nextBooks)

    void persistBookOrder(category, nextBooks).catch((error: unknown) => {
      if (rollbackBooks) updateBooks(rollbackBooks)
      console.error(error)
      window.alert(error instanceof Error ? error.message : 'Не удалось сохранить порядок книг')
    })
  }

  const handleDragStart: BookDragStartHandler = (event, bookId) => {
    if (!DND_ENABLED) return
    dragStartBooksRef.current = booksRef.current
    dropHandledRef.current = false
    setDraggedBookId(bookId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', bookId)
  }

  const handleDragOverBook: BookDragOverHandler = (event, targetBookId) => {
    if (!DND_ENABLED) return
    event.preventDefault()
    if (!draggedBookId || draggedBookId === targetBookId) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeY = (event.clientY - bounds.top) / bounds.height
    const placeAfter = relativeY > 0.65
      || (relativeY >= 0.35 && event.clientX > bounds.left + bounds.width / 2)
    const draggedBook = booksRef.current.find((book) => book.id === draggedBookId)
    const targetBook = booksRef.current.find((book) => book.id === targetBookId)
    if (!draggedBook || !targetBook || draggedBook.category !== targetBook.category) return

    const booksWithoutDragged = booksRef.current.filter((book) => book.id !== draggedBookId)
    const targetIndex = booksWithoutDragged.findIndex((book) => book.id === targetBookId)
    const insertionIndex = targetIndex + (placeAfter ? 1 : 0)
    const nextDraggedBook = draggedBook.category === 'Вне рейтинга' || draggedBook.tier === targetBook.tier
      ? draggedBook
      : { ...draggedBook, tier: targetBook.tier }
    const nextBooks = [...booksWithoutDragged]
    nextBooks.splice(insertionIndex, 0, nextDraggedBook)

    if (!booksRef.current.every((book, index) => book === nextBooks[index])) updateBooks(nextBooks)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, tierName: BookTier) {
    if (!DND_ENABLED) return
    event.preventDefault()
    const bookId = event.dataTransfer.getData('text/plain') || draggedBookId
    if (!bookId) return
    const draggedBook = booksRef.current.find((book) => book.id === bookId)
    if (!draggedBook) return

    const booksWithoutDragged = booksRef.current.filter((book) => book.id !== bookId)
    const lastTierBookIndex = booksWithoutDragged.reduce((lastIndex, book, index) => (
      book.category === draggedBook.category && book.tier === tierName ? index : lastIndex
    ), -1)
    const nextBooks = [...booksWithoutDragged]
    const movedBook = draggedBook.tier === tierName ? draggedBook : { ...draggedBook, tier: tierName }
    nextBooks.splice(lastTierBookIndex + 1, 0, movedBook)
    updateBooks(nextBooks)
    commitOrder(draggedBook.category)
    setDraggedBookId(null)
  }

  function handleDropBook() {
    if (!DND_ENABLED || !draggedBookId) return
    const draggedBook = booksRef.current.find((book) => book.id === draggedBookId)
    if (!draggedBook) return
    commitOrder(draggedBook.category)
    setDraggedBookId(null)
  }

  function handleDragEnd() {
    if (!dropHandledRef.current && dragStartBooksRef.current) updateBooks(dragStartBooksRef.current)
    setDraggedBookId(null)
    dropHandledRef.current = false
  }

  return {
    books,
    dndEnabled: DND_ENABLED,
    draggedBookId,
    handleDragEnd,
    handleDragOverBook,
    handleDragStart,
    handleDrop,
    handleDropBook,
  }
}
