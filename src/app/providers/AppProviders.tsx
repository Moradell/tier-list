import type { ReactNode } from 'react'
import { BookReorderProvider } from '@features/reorder-books'
import { BookHistoryProvider, useBookHistory } from '@features/book-history'
import { MovieHistoryProvider } from '@features/movie-history'
import { TooltipProvider } from '@shared/ui/Tooltip'

function ReorderProviderBridge({ children }: { children: ReactNode }) {
  const { addEvents } = useBookHistory()
  return <BookReorderProvider onHistoryEvents={addEvents}>{children}</BookReorderProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <BookHistoryProvider>
        <MovieHistoryProvider>
          <ReorderProviderBridge>{children}</ReorderProviderBridge>
        </MovieHistoryProvider>
      </BookHistoryProvider>
    </TooltipProvider>
  )
}
