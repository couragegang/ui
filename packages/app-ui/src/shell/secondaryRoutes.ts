import { strings } from '../strings'

const SECONDARY_PREFIXES = ['/mcp', '/connections', '/profile', '/marketplace']

export function isSecondaryPath(pathname: string): boolean {
  return SECONDARY_PREFIXES.some((p) => pathname === p || pathname.endsWith(p))
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname.includes('/onboarding/tools')
}

export function secondaryPanelTitle(pathname: string): string {
  if (pathname.includes('/mcp') || pathname.includes('/marketplace')) return strings.nav.mcp
  if (pathname.includes('/connections')) return strings.connections.title
  if (pathname.includes('/profile')) return strings.header.settings
  return strings.nav.menu
}
