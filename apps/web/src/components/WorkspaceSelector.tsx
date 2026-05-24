import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import type { Workspace } from '@couragegang/shared/types'

function workspaceLabel(w: Workspace) {
  return w.name?.trim() || w.slug || w.id.slice(0, 8)
}

type Props = {
  layout?: 'inline' | 'drawer'
  onNavigate?: () => void
}

export function WorkspaceSelector({ layout = 'inline', onNavigate }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { workspaces, workspaceId, setWorkspaceId } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = workspaces.find((w) => w.id === workspaceId)

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

  function select(id: string) {
    setWorkspaceId(id)
    setOpen(false)
  }

  function goCreate() {
    setOpen(false)
    onNavigate?.()
    navigate('/workspaces/new')
  }

  const rootClass =
    layout === 'drawer' ? 'workspace-selector workspace-selector--drawer' : 'workspace-selector'

  if (!workspaces.length) {
    return (
      <button type="button" className="workspace-trigger muted" onClick={goCreate}>
        {t('workspace.add')}
      </button>
    )
  }

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        className="workspace-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="workspace-trigger-label">
          {current ? workspaceLabel(current) : t('context.workspace')}
        </span>
        <span className="workspace-trigger-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="workspace-dropdown" role="listbox">
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              role="option"
              aria-selected={w.id === workspaceId}
              className={
                w.id === workspaceId ? 'workspace-dropdown-item active' : 'workspace-dropdown-item'
              }
              onClick={() => select(w.id)}
            >
              <span>{workspaceLabel(w)}</span>
              {w.slug && <span className="muted small">{w.slug}</span>}
            </button>
          ))}
          {workspaces.length === 1 && (
            <>
              <div className="workspace-dropdown-divider" role="separator" />
              <button type="button" className="workspace-dropdown-item add" onClick={goCreate}>
                {t('workspace.add')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
