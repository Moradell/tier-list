import type { ComponentProps, ReactElement, ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import './Tooltip.scss'

interface TooltipProps {
  trigger: ReactElement
  children: ReactNode
  contentClassName?: string
  arrowClassName?: string
  side?: ComponentProps<typeof RadixTooltip.Content>['side']
  sideOffset?: number
}

export function Tooltip({
  trigger,
  children,
  contentClassName = 'tooltip-content',
  arrowClassName = 'tooltip-arrow',
  side,
  sideOffset = 8,
}: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={contentClassName} side={side} sideOffset={sideOffset}>
          {children}
          <RadixTooltip.Arrow className={arrowClassName} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}

export const TooltipProvider = RadixTooltip.Provider
