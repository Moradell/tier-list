import { Navigate, Route, Routes } from 'react-router-dom'
import { BookCategoryPage } from '@/pages/books/BookCategoryPage'
import { BooksPage } from '@/pages/books/BooksPage'
import { BooksStatsPage } from '@/pages/books/BooksStatsPage'
import { MovieCategoryPage, MoviesPage } from '@/pages/MoviesPage'
import { MoviesStatsPage } from '@/pages/MoviesStatsPage'
import { EnergyDrinksPage } from '@/pages/EnergyDrinksPage'
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
        <Route path="books/stats" element={<BooksStatsPage />} />
        <Route path="movies" element={<MoviesPage />}>
          <Route index element={<Navigate replace to="films" />} />
          <Route path="films" element={<MovieCategoryPage category="film" />} />
          <Route path="series" element={<MovieCategoryPage category="series" />} />
          <Route path="anime" element={<MovieCategoryPage category="anime" />} />
        </Route>
        <Route path="movies/stats" element={<MoviesStatsPage />} />
        <Route path="energy-drinks" element={<EnergyDrinksPage />} />
        <Route path="*" element={<Navigate replace to="/books/novels" />} />
      </Route>
    </Routes>
  )
}
