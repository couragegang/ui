import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const nav = [
  { to: '/chat', key: 'nav.chat' },
  { to: '/hitl', key: 'nav.hitl' },
  { to: '/mcp', key: 'nav.mcp' },
  { to: '/connections', key: 'nav.connections' },
  { to: '/knowledge', key: 'nav.knowledge' },
  { to: '/profile', key: 'nav.profile' },
]

export function AppShell() {
  const { t } = useTranslation()
  const { me, workspaces, workspaceId, setWorkspaceId, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">Courage Gang AI</div>
        <nav className="sidebar-nav">
          {nav.map(({ to, key }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <div className="context-row">
            <span className="context-label">{t('context.org')}</span>
            <span className="context-value">{me?.orgId?.slice(0, 8) ?? '—'}…</span>
            <span className="context-label">{t('context.workspace')}</span>
            <select
              className="select"
              value={workspaceId ?? ''}
              onChange={(e) => setWorkspaceId(e.target.value)}
              disabled={!workspaces.length}
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            {t('auth.logout')}
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
