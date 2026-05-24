import { Outlet, useLocation } from 'react-router-dom'

import { secondaryRouteTitleKey } from '../lib/app-routes'
import { AppSecondaryPanel } from './AppSecondaryPanel'

export function SecondaryPanelLayout() {
  const location = useLocation()
  return (
    <AppSecondaryPanel titleKey={secondaryRouteTitleKey(location.pathname)}>
      <Outlet />
    </AppSecondaryPanel>
  )
}
