import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

function avatarInitials(displayName?: string | null, email?: string | null): string {
  const name = displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  const mail = email?.trim()
  if (mail) return mail.slice(0, 2).toUpperCase()
  return '?'
}

export function UserMenu() {
  const { t } = useTranslation()
  const { userDisplayName, userEmail, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  const initials = avatarInitials(userDisplayName, userEmail)

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="avatar-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('header.userMenu')}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar-circle" aria-hidden>
          {initials}
        </span>
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          {(userDisplayName || userEmail) && (
            <div className="user-dropdown-meta" role="none">
              {userDisplayName && <span className="user-dropdown-name">{userDisplayName}</span>}
              {userEmail && <span className="user-dropdown-email">{userEmail}</span>}
            </div>
          )}
          <button
            type="button"
            className="user-dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
          >
            {t('header.settings')}
          </button>
          <button
            type="button"
            className="user-dropdown-item danger"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void (async () => {
                await logout()
                navigate('/login')
              })()
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
