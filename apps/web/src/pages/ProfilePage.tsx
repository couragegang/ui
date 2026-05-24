import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  ApiError,
  createGroup,
  createWorkspace,
  fetchGroups,
  fetchOrganization,
  fetchWorkspaces,
  patchIamMe,
  patchOrganization,
  patchWorkspace,
} from '../lib/api'
import { hasPermission, IAM } from '../lib/permissions'
import { slugify } from '../lib/slug'
import { ProfileInvitesSection } from '../components/profile/ProfileInvitesSection'
import type { Organization, OrganizationGroup, Workspace } from '@couragegang/shared/types'

export function ProfilePage() {
  const { t } = useTranslation()
  const { me, organizations, userDisplayName, userEmail, refresh, switchOrganization } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [groups, setGroups] = useState<OrganizationGroup[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newWsName, setNewWsName] = useState('')
  const [newWsGroupId, setNewWsGroupId] = useState('')
  const [filterGroupId, setFilterGroupId] = useState('')

  const orgId = me?.orgId
  const canOrgRead = hasPermission(me, IAM.ORG_READ)
  const canOrgUpdate = hasPermission(me, IAM.ORG_UPDATE)
  const canGroupRead = hasPermission(me, IAM.GROUP_READ)
  const canGroupManage = hasPermission(me, IAM.GROUP_MANAGE)

  const load = useCallback(async () => {
    if (!orgId) {
      setOrg(null)
      setGroups([])
      setWorkspaces([])
      return
    }
    setError('')
    setDisplayName(userDisplayName ?? me?.user?.displayName ?? '')

    if (canOrgRead) {
      const o = await fetchOrganization(orgId)
      setOrg(o)
      setOrgName(o.name)
    } else {
      setOrg(null)
    }

    if (canGroupRead) {
      const g = await fetchGroups(orgId)
      const items = g.items ?? []
      setGroups(items)
      setNewWsGroupId((prev) => prev || items[0]?.id || '')
    } else {
      setGroups([])
    }

    const ws = await fetchWorkspaces(orgId, filterGroupId || undefined)
    setWorkspaces(ws.items ?? [])
  }, [orgId, canOrgRead, canGroupRead, filterGroupId, me?.user?.displayName, userDisplayName])

  useEffect(() => {
    void load().catch((e) => setError(e instanceof ApiError ? (e.body ?? e.message) : String(e)))
  }, [load])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      await action()
      await refresh()
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveProfile() {
    await run(async () => {
      await patchIamMe({ displayName: displayName.trim() })
      setMessage(t('profile.saved'))
    })
  }

  async function onSaveOrg() {
    if (!orgId) return
    await run(async () => {
      await patchOrganization(orgId, { name: orgName.trim() })
      setMessage(t('profile.orgSaved'))
    })
  }

  async function onCreateGroup() {
    if (!orgId || !newGroupName.trim()) return
    await run(async () => {
      await createGroup(orgId, { name: newGroupName.trim(), slug: slugify(newGroupName) })
      setNewGroupName('')
      setMessage(t('profile.groupCreated'))
    })
  }

  async function onCreateWorkspace() {
    if (!orgId || !newWsName.trim() || !newWsGroupId) return
    await run(async () => {
      await createWorkspace(orgId, {
        name: newWsName.trim(),
        slug: slugify(newWsName),
        groupId: newWsGroupId,
      })
      setNewWsName('')
      setMessage(t('profile.workspaceCreated'))
    })
  }

  async function onSwitchOrg(targetOrgId: string) {
    await run(async () => {
      await switchOrganization(targetOrgId)
      setMessage(t('profile.orgSwitched'))
    })
  }

  async function onPatchWorkspace(ws: Workspace, patch: { name?: string; status?: string }) {
    await run(async () => {
      await patchWorkspace(ws.id, patch)
      setMessage(t('profile.workspaceSaved'))
    })
  }

  return (
    <div className="page profile-page">
      <div className="row gap profile-head">
        <h1 className="flex-1">{t('header.settings')}</h1>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => void load()}>
          {t('common.refresh')}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section className="profile-section">
        <h2>{t('profile.account')}</h2>
        {me ? (
          <dl className="kv">
            <dt>{t('profile.email')}</dt>
            <dd>{userEmail ?? me.user?.email ?? '—'}</dd>
            <dt>{t('profile.displayName')}</dt>
            <dd>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </dd>
          </dl>
        ) : (
          <p className="muted">{t('common.loading')}</p>
        )}
        <button type="button" className="btn primary" disabled={busy || !displayName.trim()} onClick={() => void onSaveProfile()}>
          {t('profile.save')}
        </button>
      </section>

      {organizations.length > 1 && (
        <section className="profile-section">
          <h2>{t('profile.organizations')}</h2>
          <p className="muted">{t('profile.organizationsHint')}</p>
          <ul className="profile-org-list">
            {organizations.map((o) => (
              <li key={o.orgId} className="row gap">
                <span>
                  {o.name ?? o.slug ?? o.orgId}
                  {o.orgId === orgId && <span className="badge">{t('profile.current')}</span>}
                </span>
                {o.orgId !== orgId && (
                  <button
                    type="button"
                    className="btn outline small"
                    disabled={busy}
                    onClick={() => void onSwitchOrg(o.orgId)}
                  >
                    {t('profile.switchOrg')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!orgId && (
        <p className="muted">{t('profile.noOrg')}</p>
      )}

      {orgId && canOrgRead && org && (
        <section className="profile-section">
          <h2>{t('profile.organization')}</h2>
          <dl className="kv">
            <dt>{t('profile.orgSlug')}</dt>
            <dd>{org.slug}</dd>
            {org.planTier && (
              <>
                <dt>{t('profile.plan')}</dt>
                <dd>{org.planTier}</dd>
              </>
            )}
            <dt>{t('profile.orgName')}</dt>
            <dd>
              <input
                className="input"
                value={orgName}
                disabled={!canOrgUpdate}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </dd>
          </dl>
          {canOrgUpdate && (
            <button type="button" className="btn primary" disabled={busy} onClick={() => void onSaveOrg()}>
              {t('profile.saveOrg')}
            </button>
          )}
        </section>
      )}

      {orgId && canGroupRead && (
        <section className="profile-section">
          <h2>{t('profile.groups')}</h2>
          {groups.length === 0 ? (
            <p className="muted">{t('profile.groupsEmpty')}</p>
          ) : (
            <ul className="profile-table">
              {groups.map((g) => (
                <li key={g.id}>
                  <strong>{g.name}</strong>
                  <span className="muted">{g.slug}</span>
                  {g.isDefault && <span className="badge">{t('profile.defaultGroup')}</span>}
                </li>
              ))}
            </ul>
          )}
          {canGroupManage && (
            <div className="profile-form row gap wrap">
              <input
                className="input"
                placeholder={t('profile.newGroupName')}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button
                type="button"
                className="btn outline"
                disabled={busy || !newGroupName.trim()}
                onClick={() => void onCreateGroup()}
              >
                {t('profile.createGroup')}
              </button>
            </div>
          )}
        </section>
      )}

      {orgId && (
        <ProfileInvitesSection
          orgId={orgId}
          me={me}
          groups={groups}
          onMessage={setMessage}
          onError={setError}
        />
      )}

      {orgId && (
        <section className="profile-section">
          <h2>{t('profile.workspaces')}</h2>
          {canGroupRead && groups.length > 0 && (
            <label className="row gap">
              <span className="muted">{t('profile.filterByGroup')}</span>
              <select
                className="select"
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
              >
                <option value="">{t('profile.allGroups')}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {workspaces.length === 0 ? (
            <p className="muted">{t('profile.workspacesEmpty')}</p>
          ) : (
            <ul className="profile-table">
              {workspaces.map((w) => (
                <li key={w.id} className="workspace-row">
                  <WorkspaceRow
                    workspace={w}
                    busy={busy}
                    canEdit={canOrgUpdate}
                    onSave={(patch) => void onPatchWorkspace(w, patch)}
                    t={t}
                  />
                </li>
              ))}
            </ul>
          )}
          {canGroupRead && groups.length > 0 && (
            <div className="profile-form">
              <p className="muted">{t('profile.createWorkspaceHint')}</p>
              <div className="row gap wrap">
                <input
                  className="input"
                  placeholder={t('profile.newWorkspaceName')}
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                />
                <select
                  className="select"
                  value={newWsGroupId}
                  onChange={(e) => setNewWsGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn outline"
                  disabled={busy || !newWsName.trim() || !newWsGroupId}
                  onClick={() => void onCreateWorkspace()}
                >
                  {t('profile.createWorkspace')}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="profile-section">
        <h2>{t('profile.access')}</h2>
        <dl className="kv">
          <dt>{t('profile.userId')}</dt>
          <dd className="mono">{me?.userId ?? '—'}</dd>
          <dt>{t('profile.orgId')}</dt>
          <dd className="mono">{orgId ?? '—'}</dd>
          <dt>{t('profile.groupId')}</dt>
          <dd className="mono">{me?.groupId ?? '—'}</dd>
          <dt>{t('profile.permissions')}</dt>
          <dd>{me?.permissions?.join(', ') || '—'}</dd>
        </dl>
      </section>
    </div>
  )
}

function WorkspaceRow({
  workspace,
  busy,
  canEdit,
  onSave,
  t,
}: {
  workspace: Workspace
  busy: boolean
  canEdit: boolean
  onSave: (patch: { name?: string; status?: string }) => void
  t: (key: string) => string
}) {
  const [name, setName] = useState(workspace.name ?? '')
  const [status, setStatus] = useState(workspace.status ?? 'active')

  useEffect(() => {
    setName(workspace.name ?? '')
    setStatus(workspace.status ?? 'active')
  }, [workspace.id, workspace.name, workspace.status])

  return (
    <div className="row gap wrap flex-1">
      <input
        className="input flex-1"
        value={name}
        disabled={!canEdit || busy}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        className="select"
        value={status}
        disabled={!canEdit || busy}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="active">{t('profile.statusActive')}</option>
        <option value="archived">{t('profile.statusArchived')}</option>
      </select>
      {canEdit && (
        <button
          type="button"
          className="btn ghost small"
          disabled={busy}
          onClick={() => onSave({ name: name.trim(), status })}
        >
          {t('profile.save')}
        </button>
      )}
      <span className="muted mono">{workspace.slug}</span>
    </div>
  )
}
