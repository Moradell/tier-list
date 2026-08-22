import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@components/Tooltip'
import { BooksLayout } from '@/layouts/BooksLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { BookCategoryPage } from '@/pages/BookCategoryPage'
import { MoviesPage } from '@/pages/MoviesPage'
import { BooksProvider } from '@/providers/BooksProvider'

export default function App() {
  return (
    <TooltipProvider delayDuration={250}>
      <BooksProvider>
        <HashRouter>
          <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate replace to="/books/novels" />} />
            <Route path="books" element={<BooksLayout />}>
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
        </HashRouter>
      </BooksProvider>
    </TooltipProvider>
  )
}
