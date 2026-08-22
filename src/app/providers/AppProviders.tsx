import type { ReactNode } from 'react'
import { BookReorderProvider } from '@features/reorder-books'
import { HistoryProvider, useHistory } from '@features/history'
import { TooltipProvider } from '@shared/ui/Tooltip'

function ReorderProviderBridge({ children }: { children: ReactNode }) {
  const { addEvents } = useHistory()
  return <BookReorderProvider onHistoryEvents={addEvents}>{children}</BookReorderProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <HistoryProvider>
        <ReorderProviderBridge>{children}</ReorderProviderBridge>
      </HistoryProvider>
    </TooltipProvider>
  )
}
