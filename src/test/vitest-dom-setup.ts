import { JSDOM } from 'jsdom'

function ensureDomGlobals() {
  if (typeof globalThis.window !== 'undefined' && typeof globalThis.document !== 'undefined') {
    return
  }

  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })

  const { window } = dom
  globalThis.window = window as unknown as Window & typeof globalThis
  globalThis.document = window.document
  globalThis.navigator = window.navigator
  globalThis.HTMLElement = window.HTMLElement
  globalThis.Element = window.Element
  globalThis.Node = window.Node
  globalThis.DocumentFragment = window.DocumentFragment
  globalThis.getComputedStyle = window.getComputedStyle.bind(window)
  globalThis.Event = window.Event
  globalThis.KeyboardEvent = window.KeyboardEvent
  globalThis.MouseEvent = window.MouseEvent
  globalThis.CustomEvent = window.CustomEvent
  globalThis.localStorage = window.localStorage
  globalThis.sessionStorage = window.sessionStorage
}

ensureDomGlobals()
