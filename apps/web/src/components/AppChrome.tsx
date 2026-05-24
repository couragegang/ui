import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { ChatRoute } from '../routes/ChatRoute'
import { ChatDrawerProvider } from '../context/ChatDrawerContext'
import { ToolsOnboardingRedirect } from './ToolsOnboardingRedirect'
import { AppNavDrawer } from './AppNavDrawer'
import type { DrawerFocusSection } from './AppNavDrawer'

/** Общая оболочка: чат + drawer + единый Outlet (не размонтируется при смене маршрута). */
export function AppChrome() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerFocus, setDrawerFocus] = useState<DrawerFocusSection | null>(null)

  function openMenu(section?: DrawerFocusSection) {
    setDrawerFocus(section ?? null)
    setDrawerOpen(true)
  }

  return (
    <ChatDrawerProvider>
      <div className="app-shell">
        <ToolsOnboardingRedirect />
        <ChatRoute onOpenMenu={openMenu} />
        <AppNavDrawer
          open={drawerOpen}
          focusSection={drawerFocus}
          onClose={() => {
            setDrawerOpen(false)
            setDrawerFocus(null)
          }}
        />
        <Outlet />
      </div>
    </ChatDrawerProvider>
  )
}
