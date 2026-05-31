import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { McpCatalogItem, PolicyTemplatePack, Workspace } from '@couragegang/shared/types'
import {
  canCustomizeMcpPolicy,
  clonePolicyPack,
  emptyFormValues,
  formValuesForSubmit,
  localizedLabel,
  validateFormValues,
} from '@couragegang/shared/mcp'
import { ApiError, fetchCatalogItem, installConnector } from '../../lib/api'
import { ConnectionFormFields } from './ConnectionFormFields'
import { NotionTargetPicker } from './NotionTargetPicker'
import { TrelloBoardPicker } from './TrelloBoardPicker'
import { PolicyPackSection } from './PolicyPackSection'

type Props = {
  item: McpCatalogItem
  workspaces: Workspace[]
  initialWorkspaceId: string | null
  permissions?: string[]
  onClose: () => void
  onInstalled: () => void
}

export function McpInstallModal({
  item,
  workspaces,
  initialWorkspaceId,
  permissions,
  onClose,
  onInstalled,
}: Props) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<McpCatalogItem>(item)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId ?? workspaces[0]?.id ?? '')
  const [displayLabel, setDisplayLabel] = useState(item.displayName ?? item.connectorKey)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [policyPack, setPolicyPack] = useState<PolicyTemplatePack>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchCatalogItem(item.connectorKey)
      .then((full) => {
        if (cancelled) return
        setDetail(full)
        setFormValues(emptyFormValues(full.connectionFormSchema))
        setPolicyPack(clonePolicyPack(full.policyTemplatePack))
        if (!displayLabel.trim()) {
          setDisplayLabel(full.displayName ?? full.connectorKey)
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when connector changes
  }, [item.connectorKey])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!workspaceId) {
      setError(t('mcp.workspaceRequired'))
      return
    }
    const missing = validateFormValues(detail.connectionFormSchema, formValues)
    if (missing) {
      setError(t('mcp.fieldRequired', { field: missing }))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await installConnector(workspaceId, {
        connectorKey: detail.connectorKey,
        displayLabel: displayLabel.trim() || detail.displayName || detail.connectorKey,
        form: formValuesForSubmit(detail.connectionFormSchema, formValues),
        policyPack:
          canCustomizeMcpPolicy(permissions) && policyPack.rules?.length ? policyPack : undefined,
      })
      setSuccess(true)
      onInstalled()
      window.setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const schemaTitle = localizedLabel(
    detail.connectionFormSchema?.title,
    t('mcp.install', { name: detail.displayName ?? detail.connectorKey }),
  )

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-install-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="mcp-install-title">{schemaTitle}</h2>
          <button type="button" className="btn ghost modal-close" onClick={onClose} aria-label={t('mcp.close')}>
            ×
          </button>
        </header>

        {loading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : (
          <form className="form modal-body" onSubmit={onSubmit}>
            {detail.description && <p className="muted">{detail.description}</p>}

            <label>
              {t('context.workspace')}
              <select
                className="select"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                required
                disabled={submitting || workspaces.length === 0}
              >
                {workspaces.length === 0 && <option value="">{t('mcp.noWorkspaces')}</option>}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name ?? ws.id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t('mcp.label')}
              <input
                value={displayLabel}
                onChange={(e) => setDisplayLabel(e.target.value)}
                disabled={submitting}
              />
            </label>

            {detail.connectorKey === 'notion' && workspaceId && (
              <NotionTargetPicker
                workspaceId={workspaceId}
                integrationToken={formValues.integration_token ?? ''}
                value={formValues.default_database_id ?? ''}
                onChange={(id) =>
                  setFormValues((prev) => ({ ...prev, default_database_id: id }))
                }
                disabled={submitting}
              />
            )}

            {detail.connectorKey === 'trello' && workspaceId && (
              <TrelloBoardPicker
                workspaceId={workspaceId}
                apiKey={formValues.api_key ?? ''}
                token={formValues.token ?? ''}
                value={formValues.default_board_name ?? ''}
                onChange={(name) =>
                  setFormValues((prev) => ({ ...prev, default_board_name: name }))
                }
                disabled={submitting}
              />
            )}

            <ConnectionFormFields
              schema={detail.connectionFormSchema}
              values={formValues}
              onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
              disabled={submitting}
            />

            <PolicyPackSection
              connectorKey={detail.connectorKey}
              template={detail.policyTemplatePack}
              value={policyPack}
              onChange={setPolicyPack}
              permissions={permissions}
            />

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{t('mcp.installed')}</p>}

            <footer className="modal-footer">
              <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>
                {t('mcp.cancel')}
              </button>
              <button type="submit" className="btn primary" disabled={submitting || !workspaceId || success}>
                {submitting ? t('common.loading') : t('mcp.installBtn')}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}
