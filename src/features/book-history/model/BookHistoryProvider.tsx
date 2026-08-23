import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import historyJson from '@data/books/history.json?raw'
import { parseBookHistory, type BookHistoryEvent } from '@entities/book-history'

interface BookHistoryContextValue {
  events: BookHistoryEvent[]
  isOpen: boolean
  addEvents: (events: BookHistoryEvent[]) => void
  closeHistory: () => void
  openHistory: () => void
}

const initialHistory = parseBookHistory(JSON.parse(historyJson) as unknown)
const BookHistoryContext = createContext<BookHistoryContextValue | null>(null)

export function BookHistoryProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState(initialHistory.events)
  const [isOpen, setIsOpen] = useState(false)

  const addEvents = useCallback((newEvents: BookHistoryEvent[]) => {
    if (newEvents.length === 0) return
    setEvents((currentEvents) => {
      const knownIds = new Set(currentEvents.map((event) => event.id))
      return [...currentEvents, ...newEvents.filter((event) => !knownIds.has(event.id))]
    })
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    void fetch('/api/books/history')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Не удалось загрузить историю (${response.status})`)
        return parseBookHistory(await response.json() as unknown)
      })
      .then((history) => setEvents(history.events))
      .catch((error: unknown) => console.error(error))
  }, [])

  const value = useMemo<BookHistoryContextValue>(() => ({
    events,
    isOpen,
    addEvents,
    closeHistory: () => setIsOpen(false),
    openHistory: () => setIsOpen(true),
  }), [addEvents, events, isOpen])

  return <BookHistoryContext.Provider value={value}>{children}</BookHistoryContext.Provider>
}

export function useBookHistory(): BookHistoryContextValue {
  const context = useContext(BookHistoryContext)
  if (!context) throw new Error('useBookHistory должен использоваться внутри BookHistoryProvider')
  return context
}
