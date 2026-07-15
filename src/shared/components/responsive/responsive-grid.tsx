import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'

type GridCols = 1 | 2 | 3 | 4 | 5 | 6

type ResponsiveGridProps = PropsWithChildren<{
  mobileCols: GridCols
  tabletCols?: GridCols
  desktopCols?: GridCols
  gap?: 2 | 3 | 4 | 5 | 6
  className?: string
}>

const colsClassMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

function colsClass(cols: GridCols) {
  return colsClassMap[cols]
}

function gapClass(gap?: ResponsiveGridProps['gap']) {
  if (!gap) return 'gap-4'
  return `gap-${gap}`
}

export function ResponsiveGrid({
  mobileCols,
  tabletCols,
  desktopCols,
  gap,
  className,
  children,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid',
        colsClass(mobileCols),
        tabletCols ? `md:${colsClass(tabletCols)}` : null,
        desktopCols ? `lg:${colsClass(desktopCols)}` : null,
        gapClass(gap),
        className,
      )}
    >
      {children}
    </div>
  )
}
