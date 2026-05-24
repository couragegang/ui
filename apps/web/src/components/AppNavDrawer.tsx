import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { OrgSelector } from './OrgSelector'
import { GroupSelector } from './GroupSelector'
import { WorkspaceSelector } from './WorkspaceSelector'

import { ChatThreadList } from './chat/ChatThreadList'
import { useChatDrawer } from '../context/ChatDrawerContext'
import { useMobileLayout } from '../hooks/useMobileLayout'

export type DrawerFocusSection = 'chats' | 'tools' | 'context' | 'account'

type DrawerProps = {
  open: boolean
  onClose: () => void
  focusSection?: DrawerFocusSection | null
}

export function AppNavDrawer({ open, onClose, focusSection = null }: DrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, userDisplayName, userEmail, logout } = useAuth()
  const { registration: chatReg } = useChatDrawer()
  const isMobile = useMobileLayout()
  const [expanded, setExpanded] = useState<DrawerFocusSection | null>(null)

  useEffect(() => {
    if (!open) return
    const resolved =
      focusSection === 'chats' && !isMobile
        ? 'context'
        : focusSection ?? (isMobile ? 'chats' : 'context')
    setExpanded(resolved)
  }, [open, focusSection, isMobile])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.classList.add('app-drawer-open')
    } else {
      document.body.classList.remove('app-drawer-open')
    }
    return () => document.body.classList.remove('app-drawer-open')
  }, [open])

  function go(path: string) {
    onClose()
    navigate(path)
  }

  function toggleSection(id: DrawerFocusSection) {
    setExpanded((cur) => (cur === id ? null : id))
  }

  if (!open) return null

  return (
    <div className="app-drawer-root" role="presentation">
      <button type="button" className="app-drawer-backdrop" aria-label={t('app.closeMenu')} onClick={onClose} />
      <aside className="app-drawer" aria-label={t('nav.menu')}>
        <header className="app-drawer-head">
          <span className="app-drawer-brand">Courage Gang</span>
          <button type="button" className="app-drawer-close" onClick={onClose} aria-label={t('app.closeMenu')}>
            ×
          </button>
        </header>

        <nav className="app-drawer-sections">
          {isMobile && chatReg && (
            <DrawerSection
              title={t('app.section.chats')}
              expanded={expanded === 'chats'}
              onToggle={() => toggleSection('chats')}
            >
              <ChatThreadList
                variant="drawer"
                conversations={chatReg.conversations}
                activeId={chatReg.activeId}
                showArchived={chatReg.showArchived}
                onToggleArchived={chatReg.onToggleArchived}
                onSelect={chatReg.onSelect}
                onNew={chatReg.onNew}
                onArchive={chatReg.onArchive}
                onDelete={chatReg.onDelete}
                onAfterSelect={onClose}
                onAfterNew={() => {
                  onClose()
                  chatReg.focusComposer?.(300)
                }}
              />
            </DrawerSection>
          )}

          <DrawerSection
            title={t('app.section.tools')}
            expanded={expanded === 'tools'}
            onToggle={() => toggleSection('tools')}
          >
            <button type="button" className="app-drawer-link" onClick={() => go('/mcp')}>
              {t('nav.mcp')}
            </button>
            <button type="button" className="app-drawer-link" onClick={() => go('/connections')}>
              {t('nav.connections')}
            </button>
          </DrawerSection>

          <DrawerSection
            title={t('app.section.context')}
            expanded={expanded === 'context'}
            onToggle={() => toggleSection('context')}
          >
            <div className="app-drawer-context">
              <label className="app-drawer-field-label">{t('context.org')}</label>
              <OrgSelector layout="drawer" onNavigate={onClose} />
              {me?.orgId && (
                <>
                  <label className="app-drawer-field-label">{t('context.group')}</label>
                  <GroupSelector layout="drawer" onNavigate={onClose} />
                </>
              )}
              <label className="app-drawer-field-label">{t('context.workspace')}</label>
              <WorkspaceSelector layout="drawer" onNavigate={onClose} />
              <div className="app-drawer-actions">
                <button type="button" className="app-drawer-link subtle" onClick={() => go('/organizations/new')}>
                  {t('org.add')}
                </button>
                {me?.orgId && (
                  <button type="button" className="app-drawer-link subtle" onClick={() => go('/groups/new')}>
                    {t('group.add')}
                  </button>
                )}
                <button type="button" className="app-drawer-link subtle" onClick={() => go('/workspaces/new')}>
                  {t('workspace.add')}
                </button>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection
            title={t('app.section.account')}
            expanded={expanded === 'account'}
            onToggle={() => toggleSection('account')}
          >
            {(userDisplayName || userEmail) && (
              <div className="app-drawer-user-meta">
                {userDisplayName && <span className="app-drawer-user-name">{userDisplayName}</span>}
                {userEmail && <span className="app-drawer-user-email">{userEmail}</span>}
              </div>
            )}
            <button type="button" className="app-drawer-link" onClick={() => go('/profile')}>
              {t('header.settings')}
            </button>
            <button
              type="button"
              className="app-drawer-link danger"
              onClick={() => {
                onClose()
                void (async () => {
                  await logout()
                  navigate('/login')
                })()
              }}
            >
              {t('auth.logout')}
            </button>
          </DrawerSection>
        </nav>
      </aside>
    </div>
  )
}

function DrawerSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className={`app-drawer-section ${expanded ? 'expanded' : ''}`}>
      <button type="button" className="app-drawer-section-toggle" onClick={onToggle} aria-expanded={expanded}>
        <span>{title}</span>
        <span className="app-drawer-chevron" aria-hidden>
          {expanded ? '▾' : '▸'}
        </span>
      </button>
      {expanded && <div className="app-drawer-section-body">{children}</div>}
    </div>
  )
}
