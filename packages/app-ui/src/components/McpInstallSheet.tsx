import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import {
  canCustomizeMcpPolicy,
  clonePolicyPack,
  emptyFormValues,
  formValuesForSubmit,
  localizedLabel,
  validateFormValues,
} from '@couragegang/shared/mcp'
import type { McpCatalogItem, PolicyTemplatePack } from '@couragegang/shared/types'

import { ConnectionFormFields } from './ConnectionFormFields'
import { ModalSheet } from './ModalSheet'
import { NotionTargetPicker } from './NotionTargetPicker'
import { SelectField } from './SelectField'
import { TextField } from './TextField'
import { ErrorBanner } from './ErrorBanner'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type McpInstallSheetProps = {
  api: BffApi
  item: McpCatalogItem | null
  visible: boolean
  onClose: () => void
  onInstalled: () => void
}

export function McpInstallSheet({ api, item, visible, onClose, onInstalled }: McpInstallSheetProps) {
  const auth = useAuth()
  const [detail, setDetail] = useState<McpCatalogItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [workspaceId, setWorkspaceId] = useState(auth.workspaceId ?? '')
  const [displayLabel, setDisplayLabel] = useState('')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [policyPack, setPolicyPack] = useState<PolicyTemplatePack>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visible || !item) {
      setDetail(null)
      return
    }
    setWorkspaceId(auth.workspaceId ?? auth.workspaces[0]?.id ?? '')
    setDisplayLabel(item.displayName ?? item.connectorKey)
    let cancelled = false
    setLoading(true)
    setError('')
    void api
      .catalogItem(item.connectorKey)
      .then((full) => {
        if (cancelled) return
        const d = full as McpCatalogItem
        setDetail(d)
        setFormValues(emptyFormValues(d.connectionFormSchema))
        setPolicyPack(clonePolicyPack(d.policyTemplatePack))
        setDisplayLabel(d.displayName ?? d.connectorKey)
      })
      .catch((e) => {
        if (!cancelled) {
          setDetail(item)
          setFormValues(emptyFormValues(item.connectionFormSchema))
          setPolicyPack(clonePolicyPack(item.policyTemplatePack))
          setError(String(e))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, item, api, auth.workspaceId, auth.workspaces])

  async function onSubmit() {
    if (!workspaceId || !detail) return
    const missing = validateFormValues(detail.connectionFormSchema, formValues)
    if (missing) {
      setError(`${strings.mcp.fieldRequired}: ${missing}`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        connectorKey: detail.connectorKey,
        displayLabel: displayLabel.trim() || detail.displayName || detail.connectorKey,
        form: formValuesForSubmit(detail.connectionFormSchema, formValues),
      }
      if (canCustomizeMcpPolicy(auth.me?.permissions) && policyPack.rules?.length) {
        body.policyPack = policyPack
      }
      await api.installMcp(workspaceId, body)
      onInstalled()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const title = detail
    ? localizedLabel(detail.connectionFormSchema?.title, strings.mcp.install(detail.displayName ?? detail.connectorKey))
    : strings.nav.marketplace

  const wsOptions = auth.workspaces.map((w) => ({
    id: w.id,
    label: w.name ?? w.slug ?? w.id,
  }))

  return (
    <ModalSheet visible={visible && !!item} title={title} onClose={onClose}>
      {loading ? (
        <Text variant="muted">{strings.common.loading}</Text>
      ) : detail ? (
        <View style={styles.form}>
          {detail.description ? <Text variant="muted">{detail.description}</Text> : null}
          {auth.workspaces.length > 1 && (
            <SelectField
              label={strings.context.workspace}
              value={workspaceId}
              options={wsOptions}
              onChange={setWorkspaceId}
              disabled={submitting}
            />
          )}
          <TextField
            label={strings.mcp.label}
            value={displayLabel}
            onChangeText={setDisplayLabel}
          />
          {detail.connectorKey === 'notion' && workspaceId ? (
            <NotionTargetPicker
              api={api}
              workspaceId={workspaceId}
              integrationToken={formValues.integration_token ?? ''}
              value={formValues.default_database_id ?? ''}
              onChange={(id) =>
                setFormValues((prev) => ({ ...prev, default_database_id: id }))
              }
              disabled={submitting}
            />
          ) : null}
          <ConnectionFormFields
            schema={detail.connectionFormSchema}
            values={formValues}
            onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
            disabled={submitting}
          />
          <ErrorBanner message={error} />
          <View style={styles.footer}>
            <Button title={strings.common.cancel} variant="ghost" onPress={onClose} disabled={submitting} />
            <Button
              title={strings.mcp.installBtn}
              onPress={() => void onSubmit()}
              loading={submitting}
              disabled={!workspaceId}
            />
          </View>
        </View>
      ) : null}
    </ModalSheet>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  footer: { gap: spacing.sm, marginTop: spacing.md },
})
