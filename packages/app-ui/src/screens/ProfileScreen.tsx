import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { colors, spacing, fontSize } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import { hasPermission, IAM } from '@couragegang/shared/permissions'
import { slugify } from '@couragegang/shared/slug'
import type { Organization, OrganizationGroup, Workspace } from '@couragegang/shared/types'

import { ErrorBanner } from '../components/ErrorBanner'
import { ProfileInvitesSection } from '../components/ProfileInvitesSection'
import { Screen } from '../components/Screen'
import { SelectField } from '../components/SelectField'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type ProfileScreenProps = {
  api: BffApi
  onLogout?: () => void
  /** Базовый URL для ссылок приглашений (web: origin) */
  publicBaseUrl?: string
}

export function ProfileScreen({ api, onLogout, publicBaseUrl }: ProfileScreenProps) {
  const auth = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [org, setOrg] = useState<Organization | null>(null)
  const [groups, setGroups] = useState<OrganizationGroup[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [filterGroupId, setFilterGroupId] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newWsName, setNewWsName] = useState('')
  const [newWsGroupId, setNewWsGroupId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const orgId = auth.me?.orgId
  const canOrgRead = hasPermission(auth.me, IAM.ORG_READ)
  const canOrgUpdate = hasPermission(auth.me, IAM.ORG_UPDATE)
  const canGroupRead = hasPermission(auth.me, IAM.GROUP_READ)
  const canGroupManage = hasPermission(auth.me, IAM.GROUP_MANAGE)

  const load = useCallback(async () => {
    setDisplayName(auth.userDisplayName ?? '')
    if (!orgId) {
      setOrg(null)
      setGroups([])
      setWorkspaces([])
      return
    }
    if (canOrgRead) {
      const o = (await api.getOrganization(orgId)) as Organization
      setOrg(o)
      setOrgName(o.name)
    } else {
      setOrg(null)
    }
    if (canGroupRead) {
      const g = (await api.listGroups(orgId)) as { items?: OrganizationGroup[] }
      const items = g.items ?? []
      setGroups(items)
      setNewWsGroupId((prev) => prev || items[0]?.id || '')
    } else {
      setGroups([])
    }
    const ws = (await api.workspaces(orgId, filterGroupId || undefined)) as {
      items?: Workspace[]
    }
    setWorkspaces(ws.items ?? [])
  }, [api, orgId, canOrgRead, canGroupRead, filterGroupId, auth.userDisplayName])

  useEffect(() => {
    void load().catch((e) => setError(e instanceof ApiError ? (e.body ?? e.message) : String(e)))
  }, [load])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      await action()
      await auth.refresh()
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Text variant="title">{strings.profile.title}</Text>
      <Button title={strings.common.refresh} variant="ghost" onPress={() => void load()} loading={busy} />
      <ErrorBanner message={error} />
      {message ? <Text style={styles.ok}>{message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.profile.account}</Text>
        {auth.userEmail && <Text variant="muted">{auth.userEmail}</Text>}
        <TextField
          label={strings.profile.displayName}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
        <Button
          title={strings.common.save}
          onPress={() =>
            void run(async () => {
              await api.patchMe({ displayName: displayName.trim() })
              setMessage(strings.profile.saved)
            })
          }
          loading={busy}
        />
      </View>

      {auth.organizations.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.profile.organizations}</Text>
          <Text variant="muted">{strings.profile.organizationsHint}</Text>
          {auth.organizations.map((o) => (
            <View key={o.orgId} style={styles.row}>
              <Text style={styles.flex}>
                {o.name ?? o.slug ?? o.orgId}
                {o.orgId === orgId ? ` (${strings.profile.current})` : ''}
              </Text>
              {o.orgId !== orgId && (
                <Button
                  title={strings.profile.switchOrg}
                  variant="secondary"
                  onPress={() =>
                    void run(async () => {
                      await auth.switchOrganization(o.orgId)
                      setMessage(strings.profile.saved)
                    })
                  }
                  disabled={busy}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {orgId && canOrgRead && org && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.profile.organization}</Text>
          <Text variant="muted">{strings.profile.orgSlug}: {org.slug}</Text>
          {org.planTier ? <Text variant="muted">{strings.profile.plan}: {org.planTier}</Text> : null}
          {canOrgUpdate && (
            <>
              <TextField label={strings.profile.orgName} value={orgName} onChangeText={setOrgName} autoCapitalize="words" />
              <Button
                title={strings.common.save}
                variant="secondary"
                onPress={() =>
                  void run(async () => {
                    await api.patchOrganization(orgId, { name: orgName.trim() })
                    setMessage(strings.profile.orgSaved)
                  })
                }
                loading={busy}
              />
            </>
          )}
        </View>
      )}

      {orgId && canGroupRead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.profile.groups}</Text>
          {groups.length === 0 ? (
            <Text variant="muted">{strings.profile.groupsEmpty}</Text>
          ) : (
            groups.map((g) => (
              <View key={g.id} style={styles.listItem}>
                <Text style={styles.itemTitle}>{g.name}</Text>
                <Text variant="muted">{g.slug}</Text>
                {g.isDefault ? <Text variant="muted">default</Text> : null}
              </View>
            ))
          )}
          {canGroupManage && (
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  label={strings.profile.newGroupName}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  autoCapitalize="words"
                />
              </View>
              <Button
                title={strings.profile.createGroup}
                variant="secondary"
                onPress={() =>
                  void run(async () => {
                    await api.createGroup(orgId, {
                      name: newGroupName.trim(),
                      slug: slugify(newGroupName),
                    })
                    setNewGroupName('')
                    setMessage(strings.profile.groupCreated)
                  })
                }
                disabled={busy || !newGroupName.trim()}
              />
            </View>
          )}
        </View>
      )}

      {orgId && auth.me && (
        <ProfileInvitesSection
          api={api}
          orgId={orgId}
          me={auth.me}
          groups={groups}
          publicBaseUrl={publicBaseUrl}
          onMessage={setMessage}
          onError={setError}
        />
      )}

      {orgId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.profile.workspaces}</Text>
          {canGroupRead && groups.length > 0 && (
            <SelectField
              label={strings.profile.filterByGroup}
              value={filterGroupId}
              options={[
                { id: '', label: strings.profile.allGroups },
                ...groups.map((g) => ({ id: g.id, label: g.name ?? g.slug ?? g.id })),
              ]}
              onChange={setFilterGroupId}
            />
          )}
          {workspaces.length === 0 ? (
            <Text variant="muted">{strings.profile.workspacesEmpty}</Text>
          ) : (
            workspaces.map((w) => (
              <WorkspaceRow
                key={w.id}
                workspace={w}
                busy={busy}
                canEdit={canOrgUpdate}
                onSave={(patch) =>
                  void run(async () => {
                    await api.patchWorkspace(w.id, patch)
                    setMessage(strings.profile.workspaceSaved)
                  })
                }
              />
            ))
          )}
          {canGroupRead && groups.length > 0 && (
            <View style={styles.formBlock}>
              <Text variant="muted">{strings.profile.createWorkspaceHint}</Text>
              <TextField
                label={strings.profile.newWorkspaceName}
                value={newWsName}
                onChangeText={setNewWsName}
                autoCapitalize="words"
              />
              <SelectField
                label={strings.profile.groups}
                value={newWsGroupId}
                options={groups.map((g) => ({ id: g.id, label: g.name ?? g.slug ?? g.id }))}
                onChange={setNewWsGroupId}
              />
              <Button
                title={strings.profile.createWorkspace}
                variant="secondary"
                onPress={() =>
                  void run(async () => {
                    await api.createWorkspace(orgId, {
                      name: newWsName.trim(),
                      slug: slugify(newWsName),
                      groupId: newWsGroupId,
                    })
                    setNewWsName('')
                    setMessage(strings.profile.workspaceCreated)
                  })
                }
                disabled={busy || !newWsName.trim() || !newWsGroupId}
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.profile.access}</Text>
        <Text variant="muted">{strings.profile.userId}: {auth.me?.userId ?? '—'}</Text>
        <Text variant="muted">{strings.profile.orgId}: {orgId ?? '—'}</Text>
        <Text variant="muted">{strings.profile.groupId}: {auth.groupId ?? '—'}</Text>
      </View>

      <Button title={strings.profile.logout} variant="secondary" onPress={() => void auth.logout().then(() => onLogout?.())} />
    </Screen>
  )
}

function WorkspaceRow({
  workspace,
  busy,
  canEdit,
  onSave,
}: {
  workspace: Workspace
  busy: boolean
  canEdit: boolean
  onSave: (patch: { name?: string; status?: string }) => void
}) {
  const [name, setName] = useState(workspace.name ?? '')
  const [status, setStatus] = useState(workspace.status ?? 'active')

  useEffect(() => {
    setName(workspace.name ?? '')
    setStatus(workspace.status ?? 'active')
  }, [workspace.id, workspace.name, workspace.status])

  return (
    <View style={styles.wsRow}>
      <TextField label={workspace.slug ?? workspace.id.slice(0, 8)} value={name} onChangeText={setName} />
      {canEdit && (
        <SelectField
          label="Статус"
          value={status}
          options={[
            { id: 'active', label: strings.profile.statusActive },
            { id: 'archived', label: strings.profile.statusArchived },
          ]}
          onChange={setStatus}
          disabled={busy}
        />
      )}
      {canEdit && (
        <Button
          title={strings.common.save}
          variant="ghost"
          onPress={() => onSave({ name: name.trim(), status })}
          disabled={busy}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  ok: { color: colors.success },
  section: { gap: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  flex: { flex: 1 },
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemTitle: { color: colors.text, fontWeight: '600' },
  formBlock: { gap: spacing.md, marginTop: spacing.sm },
  wsRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
})
