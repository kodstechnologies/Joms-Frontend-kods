type PostLoginFrom = {
  pathname?: string
  search?: string
  hash?: string
} | null

export function postLoginPath<TUser>(
  sessionUser: TUser,
  from: PostLoginFrom | undefined,
  getDefaultHomeRoute: (user: TUser) => string,
): string {
  const pathname = from?.pathname
  if (pathname && pathname.startsWith('/') && !pathname.startsWith('/auth')) {
    return `${pathname}${from.search ?? ''}${from.hash ?? ''}`
  }
  return getDefaultHomeRoute(sessionUser)
}
