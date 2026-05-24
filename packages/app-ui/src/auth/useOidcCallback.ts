import { useEffect, useRef } from 'react'

import { parseOidcFragment } from './oauth'

type Options = {
  onTokens: (accessToken: string, refreshToken?: string) => void
  enabled?: boolean
}

/** Считывает `#access_token=…` после редиректа IAM OIDC (web / Expo web). */
export function useOidcCallback({ onTokens, enabled = true }: Options) {
  const handled = useRef(false)

  useEffect(() => {
    if (!enabled || handled.current) return
    if (typeof window === 'undefined') return

    const tokens = parseOidcFragment(window.location.hash)
    if (!tokens) return

    handled.current = true
    onTokens(tokens.accessToken, tokens.refreshToken)

    const path = window.location.pathname + window.location.search
    window.history.replaceState(null, '', path)
  }, [enabled, onTokens])
}
