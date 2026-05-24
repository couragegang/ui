import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, spacing } from '@couragegang/design-system/tokens'
import type { Workspace } from '@couragegang/shared/types'

import { useAuth } from '../context/AuthProvider'
import { PickerModal } from './PickerModal'
import { strings } from '../strings'

type Props = {
  onClose: () => void
}

function workspaceLabel(w: Workspace) {
  return w.name?.trim() || w.slug || w.id.slice(0, 8)
}

export function DrawerContextSection({ onClose }: Props) {
  const auth = useAuth()
  const [orgOpen, setOrgOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)
  const [wsOpen, setWsOpen] = useState(false)

  const orgOptions = auth.organizations.map((o) => ({
    id: o.orgId,
    label: o.name ?? o.slug ?? o.orgId,
  }))
  const groupOptions = auth.groups.map((g) => ({
    id: g.id,
    label: g.name ?? g.slug ?? g.id,
  }))
  const wsOptions = auth.workspaces.map((w) => ({
    id: w.id,
    label: workspaceLabel(w),
  }))

  return (
    <View style={styles.wrap}>
      {auth.organizations.length > 0 && (
        <>
          <Text style={styles.label}>{strings.context.org}</Text>
          <Pressable style={styles.trigger} onPress={() => setOrgOpen(true)}>
            <Text numberOfLines={1}>{auth.orgLabel ?? strings.context.org}</Text>
          </Pressable>
        </>
      )}
      {auth.me?.orgId && auth.groups.length > 0 && (
        <>
          <Text style={styles.label}>{strings.context.group}</Text>
          <Pressable style={styles.trigger} onPress={() => setGroupOpen(true)}>
            <Text numberOfLines={1}>{auth.groupLabel ?? strings.context.group}</Text>
          </Pressable>
        </>
      )}
      {auth.workspaces.length > 0 && (
        <>
          <Text style={styles.label}>{strings.context.workspace}</Text>
          <Pressable style={styles.trigger} onPress={() => setWsOpen(true)}>
            <Text numberOfLines={1}>
              {auth.workspaces.find((w) => w.id === auth.workspaceId)?.name ??
                strings.context.workspace}
            </Text>
          </Pressable>
        </>
      )}
      <PickerModal
        visible={orgOpen}
        title={strings.context.pickOrg}
        options={orgOptions}
        selectedId={auth.me?.orgId ?? null}
        onSelect={(id) => {
          void auth.switchOrganization(id)
          onClose()
        }}
        onClose={() => setOrgOpen(false)}
      />
      <PickerModal
        visible={groupOpen}
        title={strings.context.pickGroup}
        options={groupOptions}
        selectedId={auth.groupId}
        onSelect={(id) => {
          void auth.setGroupId(id)
          onClose()
        }}
        onClose={() => setGroupOpen(false)}
      />
      <PickerModal
        visible={wsOpen}
        title={strings.context.pickWorkspace}
        options={wsOptions}
        selectedId={auth.workspaceId}
        onSelect={(id) => {
          auth.setWorkspaceId(id)
          onClose()
        }}
        onClose={() => setWsOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.bg,
  },
})
