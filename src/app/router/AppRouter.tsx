import { Navigate, Route, Routes } from 'react-router-dom'
import { BookCategoryPage } from '@/pages/books/BookCategoryPage'
import { BooksPage } from '@/pages/books/BooksPage'
import { MoviesPage } from '@/pages/MoviesPage'
import { RootLayout } from '../layouts/RootLayout'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Navigate replace to="/books/novels" />} />
        <Route path="books" element={<BooksPage />}>
          <Route index element={<Navigate replace to="novels" />} />
          <Route path="novels" element={<BookCategoryPage category="Роман" />} />
          <Route path="stories" element={<BookCategoryPage category="Рассказ" />} />
          <Route path="manga" element={<BookCategoryPage category="Манга" />} />
          <Route path="unranked" element={<BookCategoryPage category="Вне рейтинга" />} />
        </Route>
        <Route path="movies" element={<MoviesPage />} />
        <Route path="*" element={<Navigate replace to="/books/novels" />} />
      </Route>
    </Routes>
  )
}
