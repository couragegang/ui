import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { hasPermission, IAM } from '../lib/permissions'
import type { OrganizationGroup } from '@couragegang/shared/types'

function groupLabel(g: OrganizationGroup) {
  return g.name?.trim() || g.slug || g.id.slice(0, 8)
}

type Props = {
  layout?: 'inline' | 'drawer'
  onNavigate?: () => void
}

export function GroupSelector({ layout = 'inline', onNavigate }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, groups, groupId, groupLabel: currentLabel, setGroupId } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const canManage = hasPermission(me, IAM.GROUP_MANAGE)
  const current = groups.find((g) => g.id === groupId)
  const showSelector = groups.length > 0

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

  async function select(id: string) {
    if (id === groupId) {
      setOpen(false)
      return
    }
    setBusy(true)
    try {
      await setGroupId(id)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  function goCreate() {
    setOpen(false)
    onNavigate?.()
    navigate('/groups/new')
  }

  const rootClass = layout === 'drawer' ? 'context-selector context-selector--drawer' : 'context-selector'

  if (!me?.orgId) return null

  if (!showSelector) {
    if (canManage) {
      return (
        <button type="button" className="context-trigger muted" onClick={goCreate}>
          {t('group.add')}
        </button>
      )
    }
    return null
  }

  if (groups.length === 1 && !canManage) {
    return <span className="context-value">{currentLabel ?? groupLabel(groups[0])}</span>
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
          {currentLabel ?? (current ? groupLabel(current) : t('context.group'))}
        </span>
        <span className="context-trigger-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="context-dropdown" role="listbox">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="option"
              aria-selected={g.id === groupId}
              className={g.id === groupId ? 'context-dropdown-item active' : 'context-dropdown-item'}
              disabled={busy}
              onClick={() => void select(g.id)}
            >
              {groupLabel(g)}
              {g.isDefault && <span className="muted small"> · {t('profile.defaultGroup')}</span>}
            </button>
          ))}
          {groups.length === 1 && canManage && (
            <>
              <div className="context-dropdown-divider" role="separator" />
              <button type="button" className="context-dropdown-item add" onClick={goCreate}>
                {t('group.add')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
