import { useState, type DragEvent } from 'react'
import type { BookTier } from '@lib/books'
import type { Book, BookDragOverHandler, BookDragStartHandler } from '@/types/book'

export function useBookDnd(initialBooks: Book[]) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null)

  const handleDragStart: BookDragStartHandler = (event, bookId) => {
    setDraggedBookId(bookId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', bookId)
  }

  const handleDragOverBook: BookDragOverHandler = (event, targetBookId) => {
    event.preventDefault()
    if (!draggedBookId || draggedBookId === targetBookId) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeY = (event.clientY - bounds.top) / bounds.height
    const placeAfter = relativeY > 0.65
      || (relativeY >= 0.35 && event.clientX > bounds.left + bounds.width / 2)

    setBooks((currentBooks) => {
      const draggedBook = currentBooks.find((book) => book.id === draggedBookId)
      const targetBook = currentBooks.find((book) => book.id === targetBookId)
      if (!draggedBook || !targetBook || draggedBook.category !== targetBook.category) return currentBooks

      const booksWithoutDragged = currentBooks.filter((book) => book.id !== draggedBookId)
      const targetIndex = booksWithoutDragged.findIndex((book) => book.id === targetBookId)
      const insertionIndex = targetIndex + (placeAfter ? 1 : 0)
      const nextDraggedBook = draggedBook.category === 'Вне рейтинга' || draggedBook.tier === targetBook.tier
        ? draggedBook
        : { ...draggedBook, tier: targetBook.tier }
      const nextBooks = [...booksWithoutDragged]
      nextBooks.splice(insertionIndex, 0, nextDraggedBook)

      return currentBooks.every((book, index) => book === nextBooks[index]) ? currentBooks : nextBooks
    })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, tierName: BookTier) {
    event.preventDefault()
    const bookId = event.dataTransfer.getData('text/plain') || draggedBookId
    if (!bookId) return

    setBooks((currentBooks) => {
      const draggedBook = currentBooks.find((book) => book.id === bookId)
      if (!draggedBook) return currentBooks

      const booksWithoutDragged = currentBooks.filter((book) => book.id !== bookId)
      const lastTierBookIndex = booksWithoutDragged.reduce((lastIndex, book, index) => (
        book.category === draggedBook.category && book.tier === tierName ? index : lastIndex
      ), -1)
      const nextBooks = [...booksWithoutDragged]
      const movedBook = draggedBook.tier === tierName ? draggedBook : { ...draggedBook, tier: tierName }
      nextBooks.splice(lastTierBookIndex + 1, 0, movedBook)
      return nextBooks
    })
    setDraggedBookId(null)
  }

  return {
    books,
    draggedBookId,
    handleDragEnd: () => setDraggedBookId(null),
    handleDragOverBook,
    handleDragStart,
    handleDrop,
  }
}
