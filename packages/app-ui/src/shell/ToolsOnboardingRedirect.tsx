import { useEffect } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { useWorkspaceInstallations } from '@couragegang/shared/hooks'

import { useAuth } from '../context/AuthProvider'

const ONBOARDING_PATH = '/onboarding/tools'

const EXEMPT_SUFFIXES = [
  '/login',
  '/register',
  '/mcp',
  '/marketplace',
  '/connections',
  '/profile',
  ONBOARDING_PATH,
]

function isExempt(pathname: string): boolean {
  return EXEMPT_SUFFIXES.some((p) => pathname === p || pathname.endsWith(p))
}

type Props = {
  api: BffApi
  pathname: string
  onNavigate: (path: string) => void
  isOnboardingSkipped?: (workspaceId: string) => boolean | Promise<boolean>
}

export function ToolsOnboardingRedirect({
  api,
  pathname,
  onNavigate,
  isOnboardingSkipped,
}: Props) {
  const { workspaceId, loading: authLoading } = useAuth()
  const { loading: toolsLoading, hasTools } = useWorkspaceInstallations(api, workspaceId)

  useEffect(() => {
    if (authLoading || toolsLoading) return
    if (!workspaceId) return

    void (async () => {
      if (hasTools) {
        if (pathname.endsWith(ONBOARDING_PATH)) {
          onNavigate('/chat')
        }
        return
      }

      const skipped = isOnboardingSkipped
        ? await Promise.resolve(isOnboardingSkipped(workspaceId))
        : false
      if (skipped) return
      if (isExempt(pathname)) return

      onNavigate(ONBOARDING_PATH)
    })()
  }, [
    authLoading,
    toolsLoading,
    workspaceId,
    hasTools,
    pathname,
    onNavigate,
    isOnboardingSkipped,
  ])

  return null
}
