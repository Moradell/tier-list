import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { initialBooks } from '@/data/books'
import { useBookDnd } from '@/dnd'
import type { BooksOutletContext } from '@/types/booksOutlet'

interface BooksContextValue extends BooksOutletContext {
  setFullMode: (fullMode: boolean) => void
}

const BooksContext = createContext<BooksContextValue | null>(null)

export function BooksProvider({ children }: { children: ReactNode }) {
  const [fullMode, setFullMode] = useState(false)
  const dnd = useBookDnd(initialBooks)
  const value = useMemo<BooksContextValue>(() => ({
    books: dnd.books,
    dndEnabled: dnd.dndEnabled,
    draggedBookId: dnd.draggedBookId,
    fullMode,
    onDragEnd: dnd.handleDragEnd,
    onDragOverBook: dnd.handleDragOverBook,
    onDragStart: dnd.handleDragStart,
    onDrop: dnd.handleDrop,
    onDropBook: dnd.handleDropBook,
    setFullMode,
  }), [dnd, fullMode])

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
}

export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext)
  if (!context) throw new Error('useBooks должен использоваться внутри BooksProvider')
  return context
}
