import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { t } = useTranslation()
  const { me, workspaces, workspaceId, refresh } = useAuth()

  return (
    <div className="page">
      <h1>{t('nav.profile')}</h1>
      <button type="button" className="btn ghost" onClick={() => void refresh()}>
        {t('common.refresh')}
      </button>
      <dl className="kv">
        <dt>{t('profile.userId')}</dt>
        <dd>{me?.userId ?? '—'}</dd>
        <dt>{t('profile.orgId')}</dt>
        <dd>{me?.orgId ?? '—'}</dd>
        <dt>{t('profile.groupId')}</dt>
        <dd>{me?.groupId ?? '—'}</dd>
        <dt>{t('profile.workspaceId')}</dt>
        <dd>{workspaceId ?? '—'}</dd>
        <dt>{t('profile.workspaces')}</dt>
        <dd>{workspaces.map((w) => w.name).join(', ') || '—'}</dd>
        <dt>{t('profile.permissions')}</dt>
        <dd>{me?.permissions?.join(', ') ?? '—'}</dd>
      </dl>
      <p className="muted">{t('profile.note')}</p>
    </div>
  )
}
