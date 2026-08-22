import type { Book, BookCategory } from '@/types/book'

export async function persistBookOrder(category: BookCategory, books: Book[]): Promise<void> {
  const categoryBooks = books
    .filter((book) => book.category === category)
    .map((book) => ({ id: book.id, tier: book.tier }))

  const response = await fetch('/api/books/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, books: categoryBooks }),
  })

  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(result?.error ?? `Не удалось сохранить CSV (${response.status})`)
  }
}
