import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import type { IamMeOrgSummary } from '@couragegang/shared/types'

function orgLabel(o: IamMeOrgSummary) {
  return o.name?.trim() || o.slug || o.orgId.slice(0, 8)
}

type Props = {
  layout?: 'inline' | 'drawer'
  onNavigate?: () => void
}

export function OrgSelector({ layout = 'inline', onNavigate }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, organizations, orgLabel: currentLabel, switchOrganization } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = organizations.find((o) => o.orgId === me?.orgId)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function select(orgId: string) {
    if (orgId === me?.orgId) {
      setOpen(false)
      return
    }
    setBusy(true)
    try {
      await switchOrganization(orgId)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  function goCreate() {
    setOpen(false)
    onNavigate?.()
    navigate('/organizations/new')
  }

  const rootClass = layout === 'drawer' ? 'context-selector context-selector--drawer' : 'context-selector'

  if (organizations.length === 0) {
    return (
      <button type="button" className="context-trigger muted" onClick={goCreate}>
        {t('org.add')}
      </button>
    )
  }

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        className="context-trigger"
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="context-trigger-label">
          {currentLabel ?? (current ? orgLabel(current) : '—')}
        </span>
        <span className="context-trigger-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="context-dropdown" role="listbox">
          {organizations.map((o) => (
            <button
              key={o.orgId}
              type="button"
              role="option"
              aria-selected={o.orgId === me?.orgId}
              className={
                o.orgId === me?.orgId ? 'context-dropdown-item active' : 'context-dropdown-item'
              }
              disabled={busy}
              onClick={() => void select(o.orgId)}
            >
              {orgLabel(o)}
            </button>
          ))}
          {organizations.length === 1 && (
            <>
              <div className="context-dropdown-divider" role="separator" />
              <button type="button" className="context-dropdown-item add" onClick={goCreate}>
                {t('org.add')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
