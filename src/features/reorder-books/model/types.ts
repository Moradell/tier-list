import type { DragEvent } from 'react'

export type BookDragStartHandler = (event: DragEvent<HTMLElement>, bookId: string) => void
export type BookDragOverHandler = (event: DragEvent<HTMLDivElement>, bookId: string) => void
export type BookDragEndHandler = () => void
export type BookDropHandler = () => void
