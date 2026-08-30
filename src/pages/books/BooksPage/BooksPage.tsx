import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BookOpen, CircleHelp, PanelsTopLeft, ScrollText } from 'lucide-react'
import { Tabs, type TabItem } from '@shared/ui/Tabs'
import { Tooltip } from '@shared/ui/Tooltip'
import type { BooksPageOutletContext } from '../model/types'
import './BooksPage.scss'

const bookSections: TabItem[] = [
  { icon: <BookOpen />, iconOnlyOnMobile: true, label: 'Романы', to: '/books/novels' },
  { icon: <ScrollText />, iconOnlyOnMobile: true, label: 'Рассказы', to: '/books/stories' },
  { icon: <PanelsTopLeft />, iconOnlyOnMobile: true, label: 'Манга', to: '/books/manga' },
  { icon: <CircleHelp />, iconOnlyOnMobile: true, label: 'Вне рейтинга', to: '/books/unranked' },
]

export function BooksPage() {
  const [fullMode, setFullMode] = useState(false)
  const context: BooksPageOutletContext = { fullMode }

  return (
    <>
      <div className="book-tabs-toolbar">
        <Tabs ariaLabel="Категории книг" items={bookSections} level="secondary" />
        <Tooltip
          side="bottom"
          trigger={(
            <button
              className="mode-toggle"
              type="button"
              aria-pressed={context.fullMode}
              aria-label="Полный режим"
              onClick={() => setFullMode(!context.fullMode)}
            >
              <span className="mode-toggle-track" aria-hidden="true"><span className="mode-toggle-thumb" /></span>
              <span className="mode-toggle-label">Полный режим</span>
            </button>
          )}
        >
          Полный режим
        </Tooltip>
      </div>
      <Outlet context={context} />
    </>
  )
}
