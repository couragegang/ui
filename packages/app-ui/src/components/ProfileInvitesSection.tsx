import { useCallback, useEffect, useState } from 'react'
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import { GROUP_ROLE_OPTIONS, hasPermission, IAM, ORG_ROLE_OPTIONS } from '@couragegang/shared/permissions'
import type { BffMe, OrganizationGroup, OrganizationInvite } from '@couragegang/shared/types'

import { SelectField } from './SelectField'
import { TextField } from './TextField'
import { strings } from '../strings'

export type ProfileInvitesSectionProps = {
  api: BffApi
  orgId: string
  me: BffMe | null
  groups: OrganizationGroup[]
  publicBaseUrl?: string
  onMessage: (msg: string) => void
  onError: (msg: string) => void
}

export function ProfileInvitesSection({
  api,
  orgId,
  me,
  groups,
  publicBaseUrl,
  onMessage,
  onError,
}: ProfileInvitesSectionProps) {
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [orgRole, setOrgRole] = useState('member')
  const [groupId, setGroupId] = useState('')
  const [groupRole, setGroupRole] = useState('member')
  const [lastLink, setLastLink] = useState('')

  const canRead = hasPermission(me, IAM.MEMBER_READ)
  const canInvite = hasPermission(me, IAM.MEMBER_INVITE)
  const canRevoke = hasPermission(me, IAM.MEMBER_MANAGE)

  const load = useCallback(async () => {
    if (!canRead) return
    const res = (await api.listInvites(orgId)) as { items?: OrganizationInvite[] }
    setInvites(res.items ?? [])
  }, [api, orgId, canRead])

  useEffect(() => {
    void load().catch((e) =>
      onError(e instanceof ApiError ? (e.body ?? e.message) : String(e)),
    )
  }, [load, onError])

  function groupName(id?: string | null) {
    if (!id) return strings.profile.inviteOrgOnly
    return groups.find((g) => g.id === id)?.name ?? id.slice(0, 8)
  }

  function fullInviteUrl(hint: string) {
    if (hint.startsWith('http')) return hint
    const base =
      publicBaseUrl ??
      (typeof globalThis !== 'undefined' &&
      'location' in globalThis &&
      (globalThis as { location?: { origin?: string } }).location?.origin
        ? (globalThis as { location: { origin: string } }).location.origin
        : '')
    return `${base}${hint.startsWith('/') ? hint : `/${hint}`}`
  }

  async function onCreate() {
    if (!canInvite || !email.trim()) return
    setBusy(true)
    onError('')
    setLastLink('')
    try {
      const payload: Record<string, unknown> = {
        email: email.trim(),
        roleKeys: [orgRole],
      }
      if (groupId) {
        payload.groupId = groupId
        payload.groupRoleKeys = [groupRole]
      }
      const created = (await api.createInvite(orgId, payload)) as {
        acceptUrlHint?: string | null
      }
      setEmail('')
      onMessage(strings.profile.inviteCreated)
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

  function onRevoke(inviteId: string) {
    if (!canRevoke) return
    Alert.alert(strings.profile.inviteRevoke, strings.profile.inviteRevokeConfirm, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.profile.inviteRevoke,
        style: 'destructive',
        onPress: () => void doRevoke(inviteId),
      },
    ])
  }

  async function doRevoke(inviteId: string) {
    setBusy(true)
    onError('')
    try {
      await api.revokeInvite(orgId, inviteId)
      onMessage(strings.profile.inviteRevoked)
      await load()
    } catch (err) {
      onError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function copyLink(link: string) {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(link)
        onMessage(strings.profile.inviteLinkCopied)
        return
      }
      Alert.alert(strings.profile.inviteLinkLabel, link)
    } catch {
      onError(strings.profile.inviteLinkCopyFailed)
    }
  }

  if (!canRead && !canInvite) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{strings.profile.invites}</Text>
      <Text variant="muted">{strings.profile.invitesHint}</Text>

      {canInvite && (
        <View style={styles.form}>
          <TextField
            label={strings.profile.inviteEmail}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <SelectField
            label={strings.profile.inviteOrgRole}
            value={orgRole}
            options={ORG_ROLE_OPTIONS.map((r) => ({ id: r, label: strings.profile.roles[r] ?? r }))}
            onChange={setOrgRole}
          />
          {groups.length > 0 && (
            <>
              <SelectField
                label={strings.profile.inviteGroup}
                value={groupId}
                options={[
                  { id: '', label: strings.profile.inviteNoGroup },
                  ...groups.map((g) => ({ id: g.id, label: g.name ?? g.slug ?? g.id })),
                ]}
                onChange={setGroupId}
              />
              {groupId ? (
                <SelectField
                  label={strings.profile.inviteGroupRole}
                  value={groupRole}
                  options={GROUP_ROLE_OPTIONS.map((r) => ({
                    id: r,
                    label: `${strings.profile.roles[r] ?? r} (${strings.profile.inGroup})`,
                  }))}
                  onChange={setGroupRole}
                />
              ) : null}
            </>
          )}
          <Button
            title={strings.profile.inviteSend}
            onPress={() => void onCreate()}
            loading={busy}
            disabled={!email.trim()}
          />
        </View>
      )}

      {lastLink ? (
        <View style={styles.linkBox}>
          <Text variant="muted">{strings.profile.inviteLinkLabel}</Text>
          <Text style={styles.linkCode} selectable>
            {lastLink}
          </Text>
          <Button
            title={strings.profile.inviteCopyLink}
            variant="secondary"
            onPress={() => void copyLink(lastLink)}
          />
        </View>
      ) : null}

      {canRead &&
        (invites.length === 0 ? (
          <Text variant="muted">{strings.profile.invitesEmpty}</Text>
        ) : (
          invites.map((inv) => (
            <View key={inv.id} style={styles.inviteRow}>
              <View style={styles.inviteMain}>
                <Text style={styles.inviteEmail}>{inv.email}</Text>
                <Text variant="muted">
                  {groupName(inv.groupId)} · {inv.roleKeys?.join(', ') ?? '—'}
                </Text>
              </View>
              {canRevoke && (
                <Pressable onPress={() => onRevoke(inv.id)} disabled={busy}>
                  <Text style={styles.revoke}>{strings.profile.inviteRevoke}</Text>
                </Pressable>
              )}
            </View>
          ))
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  form: { gap: spacing.md },
  linkBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkCode: { color: colors.primary, fontSize: fontSize.sm },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  inviteMain: { flex: 1, gap: 2 },
  inviteEmail: { color: colors.text, fontWeight: '600' },
  revoke: { color: colors.danger, fontSize: fontSize.sm },
})
