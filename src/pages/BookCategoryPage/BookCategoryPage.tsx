import { useOutletContext } from 'react-router-dom'
import { TierList } from '@components/TierList'
import { UnrankedShelf } from '@components/UnrankedShelf'
import type { BookCategory } from '@/types/book'
import type { BooksOutletContext } from '@/types/booksOutlet'

interface BookCategoryPageProps {
  category: BookCategory
}

export function BookCategoryPage({ category }: BookCategoryPageProps) {
  const context = useOutletContext<BooksOutletContext>()
  const books = context.books.filter((book) => book.category === category)

  if (category === 'Вне рейтинга') {
    return (
      <UnrankedShelf
        books={books}
        dndEnabled={context.dndEnabled}
        draggedBookId={context.draggedBookId}
        fullMode={context.fullMode}
        onDragEnd={context.onDragEnd}
        onDragOverBook={context.onDragOverBook}
        onDragStart={context.onDragStart}
        onDropBook={context.onDropBook}
      />
    )
  }

  return (
    <TierList
      books={books}
      dndEnabled={context.dndEnabled}
      draggedBookId={context.draggedBookId}
      fullMode={context.fullMode}
      onDragEnd={context.onDragEnd}
      onDragOverBook={context.onDragOverBook}
      onDragStart={context.onDragStart}
      onDrop={context.onDrop}
      onDropBook={context.onDropBook}
    />
  )
}
