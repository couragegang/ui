import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ApiError,
  createInvite,
  fetchInvites,
  revokeInvite,
  type CreateInvitePayload,
} from '../../lib/api'
import { GROUP_ROLE_OPTIONS, hasPermission, IAM, ORG_ROLE_OPTIONS } from '../../lib/permissions'
import type { BffMe, OrganizationGroup, OrganizationInvite } from '@couragegang/shared/types'

type Props = {
  orgId: string
  me: BffMe | null
  groups: OrganizationGroup[]
  onMessage: (msg: string) => void
  onError: (msg: string) => void
}

export function ProfileInvitesSection({ orgId, me, groups, onMessage, onError }: Props) {
  const { t } = useTranslation()
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [orgRole, setOrgRole] = useState<string>('member')
  const [groupId, setGroupId] = useState('')
  const [groupRole, setGroupRole] = useState<string>('member')
  const [lastLink, setLastLink] = useState('')

  const canRead = hasPermission(me, IAM.MEMBER_READ)
  const canInvite = hasPermission(me, IAM.MEMBER_INVITE)
  const canRevoke = hasPermission(me, IAM.MEMBER_MANAGE)

  const load = useCallback(async () => {
    if (!canRead) return
    const res = await fetchInvites(orgId)
    setInvites(res.items ?? [])
  }, [orgId, canRead])

  useEffect(() => {
    void load().catch((e) =>
      onError(e instanceof ApiError ? (e.body ?? e.message) : String(e)),
    )
  }, [load, onError])

  function groupName(id?: string | null) {
    if (!id) return t('profile.inviteOrgOnly')
    return groups.find((g) => g.id === id)?.name ?? id.slice(0, 8)
  }

  function fullInviteUrl(hint: string) {
    if (hint.startsWith('http')) return hint
    return `${window.location.origin}${hint.startsWith('/') ? hint : `/${hint}`}`
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!canInvite || !email.trim()) return
    setBusy(true)
    onError('')
    setLastLink('')
    try {
      const payload: CreateInvitePayload = {
        email: email.trim(),
        roleKeys: [orgRole],
      }
      if (groupId) {
        payload.groupId = groupId
        payload.groupRoleKeys = [groupRole]
      }
      const created = await createInvite(orgId, payload)
      setEmail('')
      onMessage(t('profile.inviteCreated'))
      if (created.acceptUrlHint) {
        setLastLink(fullInviteUrl(created.acceptUrlHint))
      }
      await load()
    } catch (err) {
      onError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function onRevoke(inviteId: string) {
    if (!canRevoke) return
    if (!window.confirm(t('profile.inviteRevokeConfirm'))) return
    setBusy(true)
    onError('')
    try {
      await revokeInvite(orgId, inviteId)
      onMessage(t('profile.inviteRevoked'))
      await load()
    } catch (err) {
      onError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      onMessage(t('profile.inviteLinkCopied'))
    } catch {
      onError(t('profile.inviteLinkCopyFailed'))
    }
  }

  if (!canRead && !canInvite) return null

  return (
    <section className="profile-section">
      <h2>{t('profile.invites')}</h2>
      <p className="muted">{t('profile.invitesHint')}</p>

      {canInvite && (
        <form className="profile-form" onSubmit={(e) => void onCreate(e)}>
          <div className="row gap wrap">
            <input
              className="input flex-1"
              type="email"
              required
              placeholder={t('profile.inviteEmail')}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
            <select className="select" value={orgRole} onChange={(ev) => setOrgRole(ev.target.value)}>
              {ORG_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`profile.role.${r}`)}
                </option>
              ))}
            </select>
          </div>
          {groups.length > 0 && (
            <div className="row gap wrap" style={{ marginTop: 8 }}>
              <select
                className="select"
                value={groupId}
                onChange={(ev) => setGroupId(ev.target.value)}
              >
                <option value="">{t('profile.inviteNoGroup')}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {groupId && (
                <select
                  className="select"
                  value={groupRole}
                  onChange={(ev) => setGroupRole(ev.target.value)}
                >
                  {GROUP_ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {t(`profile.role.${r}`)} ({t('profile.inGroup')})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <button type="submit" className="btn primary" disabled={busy || !email.trim()} style={{ marginTop: 12 }}>
            {t('profile.inviteSend')}
          </button>
        </form>
      )}

      {lastLink && (
        <div className="invite-link-box">
          <p className="muted">{t('profile.inviteLinkLabel')}</p>
          <code className="invite-link">{lastLink}</code>
          <button type="button" className="btn outline small" onClick={() => void copyLink(lastLink)}>
            {t('profile.inviteCopyLink')}
          </button>
        </div>
      )}

      {canRead && (
        <>
          {invites.length === 0 ? (
            <p className="muted">{t('profile.invitesEmpty')}</p>
          ) : (
            <ul className="profile-table invites-table">
              {invites.map((inv) => (
                <li key={inv.id}>
                  <div className="invite-row-main">
                    <strong>{inv.email}</strong>
                    <span className="muted">
                      {groupName(inv.groupId)} · {inv.roleKeys?.join(', ') ?? '—'}
                    </span>
                    {inv.expiresAt && (
                      <span className="muted small">
                        {t('profile.inviteExpires', {
                          date: new Date(inv.expiresAt).toLocaleString(),
                        })}
                      </span>
                    )}
                  </div>
                  {canRevoke && (
                    <button
                      type="button"
                      className="btn ghost small"
                      disabled={busy}
                      onClick={() => void onRevoke(inv.id)}
                    >
                      {t('profile.inviteRevoke')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
