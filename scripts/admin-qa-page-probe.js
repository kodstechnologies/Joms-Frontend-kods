export function probePage() {
  const text = document.body?.innerText || ''
  const lower = text.toLowerCase()
  const hasError =
    /something went wrong|failed to load|request failed|network error|unauthorized|403 forbidden|404 not found|error loading/i.test(
      text,
    )
  const hasLoading = /\bloading\.{0,3}\b/i.test(text) && text.length < 800
  const h = document.querySelector('h1,h2')?.textContent?.trim() || ''
  return {
    path: location.pathname,
    hasError,
    hasLoading,
    heading: h,
    snippet: text.replace(/\s+/g, ' ').slice(0, 280),
  }
}
