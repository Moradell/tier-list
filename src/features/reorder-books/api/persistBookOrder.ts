import type { Book, BookCategory } from '@entities/book'
import type { HistoryEvent } from '@entities/history'

interface PersistResult {
  event: HistoryEvent | null
  newEvents: HistoryEvent[]
}

export async function persistBookOrder(category: BookCategory, books: Book[], movedBookId: string): Promise<PersistResult> {
  const categoryBooks = books
    .filter((book) => book.category === category)
    .map((book) => ({ id: book.id, tier: book.tier }))

  const response = await fetch('/api/books/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, movedBookId, books: categoryBooks }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(result?.error ?? `Не удалось сохранить данные книг (${response.status})`)
  }

  return response.json() as Promise<PersistResult>
}
