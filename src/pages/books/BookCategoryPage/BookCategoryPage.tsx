import { useOutletContext } from 'react-router-dom'
import type { BookCategory } from '@entities/book'
import { useBookReorder } from '@features/reorder-books'
import { BookTierList } from '@widgets/BookTierList'
import { UnrankedBookList } from '@widgets/UnrankedBookList'
import type { BooksPageOutletContext } from '../model/types'

interface BookCategoryPageProps {
  category: BookCategory
}

export function BookCategoryPage({ category }: BookCategoryPageProps) {
  const { fullMode } = useOutletContext<BooksPageOutletContext>()
  const dnd = useBookReorder()
  const books = dnd.books.filter((book) => book.category === category)

  if (category === 'Вне рейтинга') {
    return (
      <UnrankedBookList
        books={books}
        dndEnabled={dnd.dndEnabled}
        draggedBookId={dnd.draggedBookId}
        fullMode={fullMode}
        onDragEnd={dnd.handleDragEnd}
        onDragOverBook={dnd.handleDragOverBook}
        onDragStart={dnd.handleDragStart}
        onDropBook={dnd.handleDropBook}
      />
    )
  }

  return (
    <BookTierList
      books={books}
      dndEnabled={dnd.dndEnabled}
      draggedBookId={dnd.draggedBookId}
      fullMode={fullMode}
      onDragEnd={dnd.handleDragEnd}
      onDragOverBook={dnd.handleDragOverBook}
      onDragStart={dnd.handleDragStart}
      onDrop={dnd.handleDrop}
      onDropBook={dnd.handleDropBook}
    />
  )
}
