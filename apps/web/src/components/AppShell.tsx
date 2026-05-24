import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ChatPage } from '../pages/ChatPage'
import { AppNavDrawer } from './AppNavDrawer'
import { AppSecondaryPanel } from './AppSecondaryPanel'
import { isSecondaryRoute, secondaryRouteTitleKey } from '../lib/app-routes'
import type { DrawerFocusSection } from './AppNavDrawer'
import { ChatDrawerProvider } from '../context/ChatDrawerContext'
import { ToolsOnboardingRedirect } from './ToolsOnboardingRedirect'
import { ToolsOnboardingPanel } from './ToolsOnboardingPanel'

export function AppShell() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerFocus, setDrawerFocus] = useState<DrawerFocusSection | null>(null)
  const showOnboarding = location.pathname.startsWith('/onboarding/')
  const showSecondary = !showOnboarding && isSecondaryRoute(location.pathname)

  function openMenu(section?: DrawerFocusSection) {
    setDrawerFocus(section ?? null)
    setDrawerOpen(true)
  }

  return (
    <ChatDrawerProvider>
      <div className="app-shell">
        <ToolsOnboardingRedirect />
        <ChatPage onOpenMenu={openMenu} />
        <AppNavDrawer
          open={drawerOpen}
          focusSection={drawerFocus}
          onClose={() => {
            setDrawerOpen(false)
            setDrawerFocus(null)
          }}
        />
        {showOnboarding && (
          <ToolsOnboardingPanel>
            <Outlet />
          </ToolsOnboardingPanel>
        )}
        {showSecondary && (
          <AppSecondaryPanel titleKey={secondaryRouteTitleKey(location.pathname)}>
            <Outlet />
          </AppSecondaryPanel>
        )}
      </div>
    </ChatDrawerProvider>
  )
}
