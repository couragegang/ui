import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWorkspaceInstallations } from '../hooks/useWorkspaceInstallations'
import { isToolsOnboardingSkipped } from '../lib/tools-onboarding'

const ONBOARDING_PATH = '/onboarding/tools'

const EXEMPT_PREFIXES = [
  '/login',
  '/register',
  '/accept-invite',
  '/organizations/new',
  '/workspaces/new',
  '/groups/new',
  '/mcp',
  '/connections',
  '/profile',
  ONBOARDING_PATH,
]

function isExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
}

export function ToolsOnboardingRedirect() {
  const { workspaceId, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { items, loading: toolsLoading, hasTools } = useWorkspaceInstallations(workspaceId)

  useEffect(() => {
    if (authLoading || toolsLoading) return
    if (!workspaceId) return

    if (hasTools) {
      if (location.pathname.startsWith(ONBOARDING_PATH)) {
        navigate('/chat', { replace: true })
      }
      return
    }

    if (isToolsOnboardingSkipped(workspaceId)) return
    if (isExempt(location.pathname)) return

    navigate(ONBOARDING_PATH, { replace: true })
  }, [
    authLoading,
    toolsLoading,
    workspaceId,
    hasTools,
    items.length,
    location.pathname,
    navigate,
  ])

  return null
}
