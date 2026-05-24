import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { localizedLabel } from '@couragegang/shared/mcp'
import type { McpCatalogItem } from '@couragegang/shared/types'

import { McpInstallSheet } from '../components/McpInstallSheet'
import { ErrorBanner } from '../components/ErrorBanner'
import { Screen } from '../components/Screen'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type McpMarketplaceScreenProps = {
  api: BffApi
  onInstalled?: () => void
  hideHeader?: boolean
}

export function McpMarketplaceScreen({ api, onInstalled, hideHeader }: McpMarketplaceScreenProps) {
  const { workspaceId } = useAuth()
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = (await api.catalog()) as { items?: McpCatalogItem[] }
      setCatalog(res.items ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    void load()
  }, [load])

  if (!workspaceId) {
    return (
      <Screen>
        <Text variant="muted">{strings.context.noWorkspace}</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      {!hideHeader && <Text variant="title">{strings.nav.mcp}</Text>}
      <Button title={strings.common.refresh} variant="ghost" onPress={() => void load()} loading={loading} />
      <ErrorBanner message={error} />
      {catalog.map((item) => (
        <View key={item.connectorKey} style={styles.card}>
          <Text style={styles.cardTitle}>{localizedLabel(item.displayName, item.connectorKey)}</Text>
          <Text variant="muted">{item.connectorKey}</Text>
          {item.description ? <Text variant="muted">{item.description}</Text> : null}
          <Button title={strings.mcp.installBtn} variant="primary" onPress={() => setSelected(item)} />
        </View>
      ))}
      {!loading && catalog.length === 0 && !error && (
        <Text variant="muted">Каталог пуст</Text>
      )}
      <McpInstallSheet
        api={api}
        item={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onInstalled={() => {
          setSelected(null)
          void load()
          onInstalled?.()
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
})
