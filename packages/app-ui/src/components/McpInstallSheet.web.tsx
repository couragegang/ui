import { useEffect, useState, type FormEvent } from 'react'
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

import { ConnectionFormFields } from './ConnectionFormFields.web'
import { ModalSheet } from './ModalSheet.web'
import { NotionTargetPicker } from './NotionTargetPicker.web'
import { TrelloBoardPicker } from './TrelloBoardPicker.web'
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
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!visible || !item) {
      setDetail(null)
      setSuccess(false)
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
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
      setSuccess(true)
      onInstalled()
      window.setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const title = detail
    ? localizedLabel(
        detail.connectionFormSchema?.title,
        strings.mcp.install(detail.displayName ?? detail.connectorKey),
      )
    : strings.nav.marketplace

  return (
    <ModalSheet
      visible={visible && !!item}
      title={title}
      titleId="mcp-install-title"
      onClose={onClose}
      asForm={!loading && !!detail}
      onSubmit={(e) => void onSubmit(e)}
    >
      {loading ? (
        <p className="muted">{strings.common.loading}</p>
      ) : detail ? (
        <>
          {detail.description ? <p className="muted">{detail.description}</p> : null}

          <label>
            {strings.context.workspace}
            <select
              className="select"
              value={workspaceId}
              disabled={submitting || auth.workspaces.length === 0}
              onChange={(e) => setWorkspaceId(e.target.value)}
              required
            >
              {auth.workspaces.length === 0 && <option value="">{strings.context.noWorkspace}</option>}
              {auth.workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name ?? w.slug ?? w.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            {strings.mcp.label}
            <input
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              disabled={submitting}
            />
          </label>

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

          {detail.connectorKey === 'trello' && workspaceId ? (
            <TrelloBoardPicker
              api={api}
              workspaceId={workspaceId}
              apiKey={formValues.api_key ?? ''}
              token={formValues.token ?? ''}
              value={formValues.default_board_name ?? ''}
              onChange={(name) =>
                setFormValues((prev) => ({ ...prev, default_board_name: name }))
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

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{strings.connections.saved}</p>}

          <footer className="modal-footer">
            <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>
              {strings.common.cancel}
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={submitting || !workspaceId || success}
            >
              {submitting ? strings.common.loading : strings.mcp.installBtn}
            </button>
          </footer>
        </>
      ) : null}
    </ModalSheet>
  )
}
