import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { fetchCatalog, checkInstallationHealth } from '../lib/api'
import type { McpCatalogItem, McpInstallation } from '../lib/types'
import { McpInstallModal } from '../components/mcp/McpInstallModal'
import { McpInstallationEditModal } from '../components/mcp/McpInstallationEditModal'
import { useWorkspaceInstallations } from '../hooks/useWorkspaceInstallations'
import { skipToolsOnboarding } from '../lib/tools-onboarding'

type Step = 'welcome' | 'connect' | 'configure' | 'chat'

const STEPS: Step[] = ['welcome', 'connect', 'configure', 'chat']

export function ToolsOnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { workspaces, workspaceId, me } = useAuth()
  const { items, loading: toolsLoading, reload, hasTools } = useWorkspaceInstallations(workspaceId)
  const [step, setStep] = useState<Step>('welcome')
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [editing, setEditing] = useState<McpInstallation | null>(null)
  const [healthMessage, setHealthMessage] = useState('')
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const [healthBusy, setHealthBusy] = useState(false)

  useEffect(() => {
    setCatalogLoading(true)
    setCatalogError('')
    void fetchCatalog()
      .then((c) => setCatalog(c.items ?? []))
      .catch((e) => setCatalogError(String(e)))
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    if (hasTools && step === 'welcome') {
      setStep('configure')
    }
  }, [hasTools, step])

  function goToChat() {
    navigate('/chat', { replace: true })
  }

  function onSkip() {
    if (workspaceId) skipToolsOnboarding(workspaceId)
    goToChat()
  }

  async function onHealth(item: McpInstallation) {
    if (!workspaceId) return
    setHealthBusy(true)
    setHealthMessage('')
    setHealthOk(null)
    try {
      const res = await checkInstallationHealth(workspaceId, item.id)
      setHealthOk(res.ok)
      setHealthMessage(
        res.ok ? t('connections.healthOk') : t('connections.healthFail', { msg: res.message ?? '' }),
      )
      await reload()
    } catch (e) {
      setHealthOk(false)
      setHealthMessage(String(e))
    } finally {
      setHealthBusy(false)
    }
  }

  function onInstalled() {
    void reload()
    setStep('configure')
  }

  const stepIndex = STEPS.indexOf(step)

  if (!workspaceId) {
    return (
      <div className="tools-onboarding">
        <p className="muted">{t('context.noWorkspace')}</p>
      </div>
    )
  }

  return (
    <div className="tools-onboarding">
      <header className="tools-onboarding-head">
        <div>
          <p className="tools-onboarding-eyebrow">{t('onboarding.eyebrow')}</p>
          <h1 className="tools-onboarding-title">{t('onboarding.title')}</h1>
        </div>
        <button type="button" className="btn ghost tools-onboarding-skip" onClick={onSkip}>
          {t('onboarding.skip')}
        </button>
      </header>

      <ol className="tools-onboarding-steps" aria-label={t('onboarding.progress')}>
        {STEPS.map((id, i) => (
          <li
            key={id}
            className={`tools-onboarding-step-dot ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'current' : ''}`}
          >
            <span className="tools-onboarding-step-num">{i + 1}</span>
            <span className="tools-onboarding-step-label">{t(`onboarding.steps.${id}`)}</span>
          </li>
        ))}
      </ol>

      <div className="tools-onboarding-body">
        {step === 'welcome' && (
          <section className="tools-onboarding-section">
            <p className="tools-onboarding-lead">{t('onboarding.welcomeLead')}</p>
            <ul className="tools-onboarding-list">
              <li>{t('onboarding.welcomePoint1')}</li>
              <li>{t('onboarding.welcomePoint2')}</li>
              <li>{t('onboarding.welcomePoint3')}</li>
            </ul>
            <div className="tools-onboarding-actions">
              <button type="button" className="btn primary" onClick={() => setStep('connect')}>
                {t('onboarding.start')}
              </button>
            </div>
          </section>
        )}

        {step === 'connect' && (
          <section className="tools-onboarding-section">
            <h2>{t('onboarding.connectTitle')}</h2>
            <p className="muted">{t('onboarding.connectHint')}</p>
            {catalogLoading && <p className="muted">{t('common.loading')}</p>}
            {catalogError && <p className="error">{catalogError}</p>}
            <ul className="card-list marketplace-grid tools-onboarding-catalog">
              {catalog.map((c) => (
                <li key={c.connectorKey}>
                  <button
                    type="button"
                    className="card clickable marketplace-card"
                    onClick={() => setSelected(c)}
                  >
                    <div className="card-title">{c.displayName ?? c.connectorKey}</div>
                    <div className="muted">{c.connectorKey}</div>
                    {c.description && <p>{c.description}</p>}
                    <span className="badge">{t('mcp.addTool')}</span>
                  </button>
                </li>
              ))}
            </ul>
            {!catalogLoading && catalog.length === 0 && !catalogError && (
              <p className="muted">{t('mcp.catalogEmpty')}</p>
            )}
            {hasTools && (
              <p className="success">{t('onboarding.connectedCount', { count: items.length })}</p>
            )}
            <div className="tools-onboarding-actions">
              <button type="button" className="btn ghost" onClick={() => setStep('welcome')}>
                {t('onboarding.back')}
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={!hasTools}
                onClick={() => setStep('configure')}
              >
                {t('onboarding.next')}
              </button>
            </div>
          </section>
        )}

        {step === 'configure' && (
          <section className="tools-onboarding-section">
            <h2>{t('onboarding.configureTitle')}</h2>
            <p className="muted">{t('onboarding.configureHint')}</p>
            {toolsLoading && <p className="muted">{t('common.loading')}</p>}
            {!toolsLoading && items.length === 0 && (
              <p className="muted">{t('connections.empty')}</p>
            )}
            <ul className="card-list tools-onboarding-connections">
              {items.map((i) => (
                <li key={i.id} className="card">
                  <div className="card-title">{i.displayLabel ?? i.connectorKey}</div>
                  <div className="muted">{i.connectorKey}</div>
                  <span className={`badge status-${i.status ?? 'active'}`}>{i.status ?? 'active'}</span>
                  <div className="row gap connections-actions">
                    <button type="button" className="btn outline" onClick={() => setEditing(i)}>
                      {t('connections.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={healthBusy}
                      onClick={() => void onHealth(i)}
                    >
                      {t('connections.healthCheck')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {healthMessage && (
              <p className={healthOk ? 'success' : 'error'}>{healthMessage}</p>
            )}
            <div className="tools-onboarding-actions">
              <button type="button" className="btn ghost" onClick={() => setStep('connect')}>
                {t('onboarding.back')}
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={!hasTools}
                onClick={() => setStep('chat')}
              >
                {t('onboarding.next')}
              </button>
            </div>
          </section>
        )}

        {step === 'chat' && (
          <section className="tools-onboarding-section">
            <h2>{t('onboarding.chatTitle')}</h2>
            <p className="muted">{t('onboarding.chatHint')}</p>
            <div className="tools-onboarding-examples">
              <p className="tools-onboarding-examples-label">{t('onboarding.examplesLabel')}</p>
              <blockquote className="tools-onboarding-example">{t('onboarding.example1')}</blockquote>
              <blockquote className="tools-onboarding-example">{t('onboarding.example2')}</blockquote>
            </div>
            <p className="muted tools-onboarding-hitl">{t('onboarding.hitlNote')}</p>
            <div className="tools-onboarding-actions">
              <button type="button" className="btn ghost" onClick={() => setStep('configure')}>
                {t('onboarding.back')}
              </button>
              <button type="button" className="btn primary" onClick={goToChat}>
                {t('onboarding.finish')}
              </button>
            </div>
          </section>
        )}
      </div>

      {selected && (
        <McpInstallModal
          item={selected}
          workspaces={workspaces}
          initialWorkspaceId={workspaceId}
          permissions={me?.permissions}
          onClose={() => setSelected(null)}
          onInstalled={onInstalled}
        />
      )}

      {editing && (
        <McpInstallationEditModal
          workspaceId={workspaceId}
          installation={editing}
          onClose={() => setEditing(null)}
          onSaved={() => void reload()}
        />
      )}
    </div>
  )
}
