import { createContext, useContext, type ReactNode } from 'react'

type SidebarShellContextValue = {
  isCollapsed: boolean
}

const SidebarShellContext = createContext<SidebarShellContextValue>({
  isCollapsed: false,
})

export function SidebarShellProvider({
  isCollapsed,
  children,
}: {
  isCollapsed: boolean
  children: ReactNode
}) {
  return (
    <SidebarShellContext.Provider value={{ isCollapsed }}>{children}</SidebarShellContext.Provider>
  )
}

export function useSidebarShell() {
  return useContext(SidebarShellContext)
}
