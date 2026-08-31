import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { FormField } from './form-field'

describe('FormField A11Y-05', () => {
  let root: Root
  let host: HTMLDivElement

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    host.remove()
  })

  it('associates the label with the input via htmlFor/id', () => {
    act(() => {
      root.render(
        <FormField label="Email ID">
          <input />
        </FormField>,
      )
    })

    const input = host.querySelector('input')
    const label = host.querySelector('label')
    expect(input?.id).toBeTruthy()
    expect(label?.htmlFor).toBe(input?.id)
    expect(label?.textContent).toMatch(/Email ID/)
  })
})
