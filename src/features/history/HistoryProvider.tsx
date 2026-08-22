import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import historyJson from '@data/history.json?raw'
import { parseHistory, type HistoryEvent } from '@entities/history'

interface HistoryContextValue {
  events: HistoryEvent[]
  isOpen: boolean
  addEvents: (events: HistoryEvent[]) => void
  closeHistory: () => void
  openHistory: () => void
}

const initialHistory = parseHistory(JSON.parse(historyJson) as unknown)
const HistoryContext = createContext<HistoryContextValue | null>(null)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState(initialHistory.events)
  const [isOpen, setIsOpen] = useState(false)

  const addEvents = useCallback((newEvents: HistoryEvent[]) => {
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
        return parseHistory(await response.json() as unknown)
      })
      .then((history) => setEvents(history.events))
      .catch((error: unknown) => console.error(error))
  }, [])

  const value = useMemo<HistoryContextValue>(() => ({
    events,
    isOpen,
    addEvents,
    closeHistory: () => setIsOpen(false),
    openHistory: () => setIsOpen(true),
  }), [addEvents, events, isOpen])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext)
  if (!context) throw new Error('useHistory должен использоваться внутри HistoryProvider')
  return context
}
