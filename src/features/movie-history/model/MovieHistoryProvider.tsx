import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import historyJson from '@data/movies/history.json?raw'
import { parseMovieHistory, type MovieHistoryEvent } from '@entities/movie'

interface MovieHistoryContextValue {
  closeHistory: () => void
  events: MovieHistoryEvent[]
  isOpen: boolean
  openHistory: () => void
}

const initialHistory = parseMovieHistory(JSON.parse(historyJson) as unknown)
const MovieHistoryContext = createContext<MovieHistoryContextValue | null>(null)

export function MovieHistoryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo<MovieHistoryContextValue>(() => ({
    closeHistory: () => setIsOpen(false),
    events: initialHistory.events,
    isOpen,
    openHistory: () => setIsOpen(true),
  }), [isOpen])

  return <MovieHistoryContext.Provider value={value}>{children}</MovieHistoryContext.Provider>
}

export function useMovieHistory(): MovieHistoryContextValue {
  const context = useContext(MovieHistoryContext)
  if (!context) throw new Error('useMovieHistory должен использоваться внутри MovieHistoryProvider')
  return context
}
