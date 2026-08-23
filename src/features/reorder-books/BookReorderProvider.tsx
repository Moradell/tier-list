import { createContext, useContext, type ReactNode } from 'react'
import { initialBooks } from '@entities/book'
import type { BookHistoryEvent } from '@entities/book-history'
import { useBookDnd } from './model/useBookDnd'

type BookReorderContextValue = ReturnType<typeof useBookDnd>

const BookReorderContext = createContext<BookReorderContextValue | null>(null)

interface BookReorderProviderProps {
  children: ReactNode
  onHistoryEvents: (events: BookHistoryEvent[]) => void
}

export function BookReorderProvider({ children, onHistoryEvents }: BookReorderProviderProps) {
  const dnd = useBookDnd(initialBooks, onHistoryEvents)

  return <BookReorderContext.Provider value={dnd}>{children}</BookReorderContext.Provider>
}

export function useBookReorder(): BookReorderContextValue {
  const context = useContext(BookReorderContext)
  if (!context) throw new Error('useBookReorder должен использоваться внутри BookReorderProvider')
  return context
}
