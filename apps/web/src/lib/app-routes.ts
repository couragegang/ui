const SECONDARY_PREFIXES = [
  '/mcp',
  '/connections',
  '/profile',
  '/workspaces/',
  '/organizations/',
  '/groups/',
]

export function isSecondaryRoute(pathname: string): boolean {
  return SECONDARY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
}

export function secondaryRouteTitleKey(pathname: string): string {
  if (pathname.startsWith('/mcp')) return 'nav.mcp'
  if (pathname.startsWith('/connections')) return 'nav.connections'
  if (pathname.startsWith('/profile')) return 'header.settings'
  if (pathname.startsWith('/organizations/new')) return 'org.createTitle'
  if (pathname.startsWith('/groups/new')) return 'group.createTitle'
  if (pathname.startsWith('/workspaces/new')) return 'workspace.createTitle'
  return 'nav.menu'
}
