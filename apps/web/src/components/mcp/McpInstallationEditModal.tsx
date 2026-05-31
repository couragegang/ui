import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ConnectionFormSchema, McpInstallation } from '@couragegang/shared/types'
import {
  formValuesForSubmit,
  formValuesFromInstallation,
  localizedLabel,
  validateFormValues,
} from '@couragegang/shared/mcp'
import { ApiError, fetchInstallation, updateInstallation } from '../../lib/api'
import { ConnectionFormFields } from './ConnectionFormFields'
import { NotionTargetPicker } from './NotionTargetPicker'
import { TrelloBoardPicker } from './TrelloBoardPicker'

type Props = {
  workspaceId: string
  installation: McpInstallation
  onClose: () => void
  onSaved: () => void
}

export function McpInstallationEditModal({ workspaceId, installation, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(installation.displayLabel ?? installation.connectorKey)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [schema, setSchema] = useState<ConnectionFormSchema>()
  const [secretsConfigured, setSecretsConfigured] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchInstallation(workspaceId, installation.id)
      .then((detail) => {
        if (cancelled) return
        const inst = detail.installation ?? installation
        setDisplayLabel(inst.displayLabel ?? inst.connectorKey)
        setSchema(detail.connectionFormSchema)
        setSecretsConfigured(Boolean(detail.secretsConfigured))
        setFormValues(
          formValuesFromInstallation(
            detail.connectionFormSchema,
            detail.config as Record<string, string | number | boolean> | undefined,
          ),
        )
      })
      .catch((e) => {
        if (!cancelled) setError(String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [workspaceId, installation])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const missing = validateFormValues(schema, formValues, { secretsOptional: true, secretsConfigured })
    if (missing) {
      setError(t('connections.fieldRequired', { field: missing }))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateInstallation(workspaceId, installation.id, {
        displayLabel: displayLabel.trim() || installation.connectorKey,
        form: formValuesForSubmit(schema, formValues, { omitEmptySecrets: true }),
      })
      setSuccess(true)
      onSaved()
      window.setTimeout(() => onClose(), 900)
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const title = localizedLabel(
    schema?.title,
    t('connections.editTitle', { name: installation.displayLabel ?? installation.connectorKey }),
  )

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn ghost modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        {loading ? (
          <p className="muted modal-body">{t('common.loading')}</p>
        ) : (
          <form className="form modal-body" onSubmit={onSubmit}>
            <p className="muted">{installation.connectorKey}</p>
            <label>
              {t('mcp.label')}
              <input
                value={displayLabel}
                onChange={(e) => setDisplayLabel(e.target.value)}
                disabled={submitting}
              />
            </label>
            {installation.connectorKey === 'notion' && (
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
            {installation.connectorKey === 'trello' && (
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
              schema={schema}
              values={formValues}
              onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
              disabled={submitting}
              secretPlaceholder={secretsConfigured ? t('connections.secretKeep') : undefined}
            />
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{t('connections.saved')}</p>}
            <footer className="modal-footer">
              <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>
                {t('mcp.cancel')}
              </button>
              <button type="submit" className="btn primary" disabled={submitting || success}>
                {submitting ? t('common.loading') : t('connections.save')}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}
