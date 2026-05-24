import { useCallback, useEffect, useState } from 'react'
import { fetchInstallations } from '../lib/api'
import type { McpInstallation } from '../lib/types'

export function useWorkspaceInstallations(workspaceId: string | null) {
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
      const res = await fetchInstallations(workspaceId)
      setItems(res.items ?? [])
    } catch (e) {
      setError(String(e))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, loading, error, reload, hasTools: items.length > 0 }
}
