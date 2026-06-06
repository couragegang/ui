import { useEffect, useState, type FormEvent } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import {
  formValuesForSubmit,
  formValuesFromInstallation,
  validateFormValues,
} from '@couragegang/shared/mcp'
import type { ConnectionFormSchema, McpInstallation } from '@couragegang/shared/types'

import { ConnectionFormFields } from './ConnectionFormFields.web'
import { ModalSheet } from './ModalSheet.web'
import { NotionTargetPicker } from './NotionTargetPicker.web'
import { TrelloAuthorizeLink } from './TrelloAuthorizeLink.web'
import { TrelloBoardPicker } from './TrelloBoardPicker.web'
import { strings } from '../strings'

export type McpInstallationEditSheetProps = {
  api: BffApi
  workspaceId: string
  installation: McpInstallation | null
  visible: boolean
  onClose: () => void
  onSaved: () => void
}

export function McpInstallationEditSheet({
  api,
  workspaceId,
  installation,
  visible,
  onClose,
  onSaved,
}: McpInstallationEditSheetProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [displayLabel, setDisplayLabel] = useState('')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [schema, setSchema] = useState<ConnectionFormSchema>()
  const [secretsConfigured, setSecretsConfigured] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visible || !installation) return
    let cancelled = false
    setLoading(true)
    setError('')
    void api
      .getInstallation(workspaceId, installation.id)
      .then((detail) => {
        if (cancelled) return
        const d = detail as {
          installation?: McpInstallation
          connectionFormSchema?: ConnectionFormSchema
          secretsConfigured?: boolean
          config?: Record<string, string | number | boolean>
        }
        const inst = d.installation ?? installation
        setDisplayLabel(inst.displayLabel ?? inst.connectorKey)
        setSchema(d.connectionFormSchema)
        setSecretsConfigured(Boolean(d.secretsConfigured))
        setFormValues(formValuesFromInstallation(d.connectionFormSchema, d.config))
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
  }, [api, workspaceId, installation, visible])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!installation) return
    const missing = validateFormValues(schema, formValues, {
      secretsOptional: true,
      secretsConfigured,
    })
    if (missing) {
      setError(`${strings.mcp.fieldRequired}: ${missing}`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.updateInstallation(workspaceId, installation.id, {
        displayLabel: displayLabel.trim() || installation.connectorKey,
        form: formValuesForSubmit(schema, formValues, { omitEmptySecrets: true }),
      } as Record<string, unknown>)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const title = installation
    ? strings.connections.editTitle(installation.displayLabel ?? installation.connectorKey)
    : strings.connections.title

  return (
    <ModalSheet
      visible={visible && !!installation}
      title={title}
      onClose={onClose}
      asForm={!loading && !!installation}
      onSubmit={(e) => void onSubmit(e)}
    >
      {loading ? (
        <p className="muted">{strings.common.loading}</p>
      ) : installation ? (
        <>
          <p className="muted">{installation.connectorKey}</p>
          <label>
            {strings.mcp.label}
            <input
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              disabled={submitting}
            />
          </label>
          {installation.connectorKey === 'notion' && (
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
          )}
          {installation.connectorKey === 'trello' && (
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
          )}
          <ConnectionFormFields
            schema={schema}
            values={formValues}
            onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
            disabled={submitting}
            secretPlaceholder={secretsConfigured ? strings.connections.secretKeep : undefined}
            renderAfterField={(field) =>
              installation.connectorKey === 'trello' && field.key === 'api_key' ? (
                <TrelloAuthorizeLink apiKey={formValues.api_key ?? ''} disabled={submitting} />
              ) : null
            }
          />
          {error && <p className="error">{error}</p>}
          <footer className="modal-footer">
            <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>
              {strings.common.cancel}
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? strings.common.loading : strings.common.save}
            </button>
          </footer>
        </>
      ) : null}
    </ModalSheet>
  )
}
