import { useState, type DragEvent } from 'react'
import novelsCsv from '@data/novels.csv?raw'
import storiesCsv from '@data/stories.csv?raw'
import mangaCsv from '@data/manga.csv?raw'
import unrankedCsv from '@data/unranked.csv?raw'
import { Tabs } from '@components/Tabs'
import { TooltipProvider } from '@components/Tooltip'
import { parseBooksCsv, type BookTier } from '@lib/books'
import type { Book, BookCategory, BookDragStartHandler } from '@/types/book'

function prepareBooks(csv: string, category: BookCategory, sourceName: string): Book[] {
  return parseBooksCsv(csv, sourceName).map((book) => ({
    ...book,
    category,
    id: book.url.match(/\/book\/(\d+)/)?.[1] ?? book.url,
  }))
}

const initialBooks: Book[] = [
  ...prepareBooks(novelsCsv, 'Роман', 'data/novels.csv'),
  ...prepareBooks(storiesCsv, 'Рассказ', 'data/stories.csv'),
  ...prepareBooks(mangaCsv, 'Манга', 'data/manga.csv'),
  ...prepareBooks(unrankedCsv, 'Вне рейтинга', 'data/unranked.csv'),
]

export default function App() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null)
  const [fullMode, setFullMode] = useState(false)

  const handleDragStart: BookDragStartHandler = (event, bookId) => {
    setDraggedBookId(bookId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', bookId)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, tierName: BookTier) {
    event.preventDefault()
    const bookId = event.dataTransfer.getData('text/plain') || draggedBookId
    setBooks((currentBooks) => currentBooks.map((book) => (
      book.id === bookId ? { ...book, tier: tierName } : book
    )))
    setDraggedBookId(null)
  }

  return (
    <TooltipProvider delayDuration={250}>
      <Tabs
        books={books}
        fullMode={fullMode}
        onFullModeChange={setFullMode}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
    </TooltipProvider>
  )
}
