import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import type { Workspace } from '@couragegang/shared/types'
import type { DrawerFocusSection } from '../AppNavDrawer'

type Props = {
  variant: 'sidebar' | 'mobile-bar'
  onOpenMenu: (section?: DrawerFocusSection) => void
}

function avatarInitials(displayName?: string | null, email?: string | null): string {
  const name = displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  const mail = email?.trim()
  if (mail) return mail.slice(0, 2).toUpperCase()
  return '?'
}

function workspaceLabel(w: Workspace) {
  return w.name?.trim() || w.slug || w.id.slice(0, 8)
}

function ContextSummary({
  initials,
  displayName,
  metaLine,
}: {
  initials: string
  displayName: string
  metaLine: string
}) {
  return (
    <>
      <span className="chat-context-footer-avatar" aria-hidden>
        {initials}
      </span>
      <span className="chat-context-footer-text">
        <span className="chat-context-footer-name">{displayName}</span>
        <span className="chat-context-footer-meta">{metaLine}</span>
      </span>
      <span className="chat-context-footer-chevron" aria-hidden>
        <ChevronIcon />
      </span>
    </>
  )
}

export function ChatContextFooter({ variant, onOpenMenu }: Props) {
  const { t } = useTranslation()
  const {
    userDisplayName,
    userEmail,
    orgLabel,
    groupLabel,
    workspaces,
    workspaceId,
    me,
  } = useAuth()

  const initials = avatarInitials(userDisplayName, userEmail)
  const workspace = workspaces.find((w) => w.id === workspaceId)
  const wsLabel = workspace ? workspaceLabel(workspace) : null

  const contextLine = [orgLabel, groupLabel, wsLabel].filter(Boolean).join(' · ') || t('app.contextUnset')
  const displayName = userDisplayName?.trim() || userEmail || t('app.guest')
  const metaLine = me?.orgId ? contextLine : t('context.noWorkspace')

  if (variant === 'mobile-bar') {
    return (
      <div className="chat-context-mobile-bar">
        <button
          type="button"
          className="chat-context-mobile-menu"
          onClick={() => onOpenMenu('chats')}
          aria-label={t('nav.menu')}
          title={t('nav.menu')}
        >
          <MenuIcon />
          <span className="chat-context-mobile-menu-label">{t('nav.menu')}</span>
        </button>
        <button
          type="button"
          className="chat-context-mobile-summary"
          onClick={() => onOpenMenu('context')}
          aria-label={t('app.openContext')}
          title={t('app.openContext')}
        >
          <ContextSummary
            initials={initials}
            displayName={displayName}
            metaLine={metaLine}
          />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="chat-context-footer chat-context-footer--sidebar"
      onClick={() => onOpenMenu('context')}
      aria-label={t('app.openContext')}
      title={t('app.openContext')}
    >
      <ContextSummary
        initials={initials}
        displayName={displayName}
        metaLine={metaLine}
      />
    </button>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
