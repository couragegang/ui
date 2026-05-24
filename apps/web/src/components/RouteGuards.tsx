import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export function ProtectedLayout() {
  const { loading, me } = useAuth()
  const { t } = useTranslation()

  if (loading) return <p className="center muted">{t('common.loading')}</p>
  if (!me) return <Navigate to="/login" replace />
  return <Outlet />
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { loading, me } = useAuth()
  if (loading) return null
  if (me) return <Navigate to="/chat" replace />
  return children
}
