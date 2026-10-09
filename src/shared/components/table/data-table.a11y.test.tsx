import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { DataTable } from '@/shared/components/table/data-table'

type Row = { id: string; name: string }

const columns: ColumnDef<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'actions', header: 'Actions', cell: () => null },
]

const data: Row[] = [
  { id: '1', name: 'Bravo' },
  { id: '2', name: 'Alpha' },
]

describe('DataTable sortable headers (MTSRT-014)', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    act(() => {
      root.render(
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          searchValue=""
          onSearchChange={() => {}}
          pagination={{
            page: 1,
            pageSize: 10,
            totalItems: 2,
            totalPages: 1,
            onPageChange: () => {},
          }}
        />,
      )
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    host.remove()
  })

  it('renders sortable headers as focusable buttons with aria-sort', () => {
    const header = host.querySelector('th[aria-sort]') as HTMLTableCellElement
    expect(header).toBeTruthy()
    expect(header.getAttribute('aria-sort')).toBe('none')

    const button = header.querySelector('button') as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('Name')

    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('cycles aria-sort when the header button is activated', () => {
    const header = host.querySelector('th[aria-sort]') as HTMLTableCellElement
    const button = header.querySelector('button') as HTMLButtonElement

    act(() => button.click())
    expect(header.getAttribute('aria-sort')).toBe('ascending')
    expect(host.querySelector('tbody tr td')?.textContent).toBe('Alpha')

    act(() => button.click())
    expect(header.getAttribute('aria-sort')).toBe('descending')

    act(() => button.click())
    expect(header.getAttribute('aria-sort')).toBe('none')
  })

  it('does not make non-sortable headers interactive', () => {
    const headers = Array.from(host.querySelectorAll('th'))
    const actions = headers.find((th) => th.textContent?.includes('Actions'))
    expect(actions?.hasAttribute('aria-sort')).toBe(false)
    expect(actions?.querySelector('button')).toBeNull()
  })
})
