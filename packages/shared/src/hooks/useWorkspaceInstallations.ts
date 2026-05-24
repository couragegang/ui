import { useCallback, useEffect, useState } from 'react'

import type { BffApi } from '@couragegang/api-client'

import type { McpInstallation } from '../types'

export function useWorkspaceInstallations(api: BffApi, workspaceId: string | null) {
  const [items, setItems] = useState<McpInstallation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!workspaceId) {
      setItems([])
      setError('')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = (await api.installations(workspaceId)) as { items?: McpInstallation[] }
      setItems(res.items ?? [])
    } catch (e) {
      setError(String(e))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [api, workspaceId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, loading, error, reload, hasTools: items.length > 0 }
}
