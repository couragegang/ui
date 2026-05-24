import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'
import { PickerModal } from './PickerModal'

export function ContextBar() {
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
    label: w.name ?? w.slug ?? w.id,
  }))

  return (
    <View style={styles.bar}>
      {auth.organizations.length > 1 && (
        <Chip label={auth.orgLabel ?? strings.context.org} onPress={() => setOrgOpen(true)} />
      )}
      {auth.groups.length > 0 && (
        <Chip label={auth.groupLabel ?? strings.context.group} onPress={() => setGroupOpen(true)} />
      )}
      {auth.workspaces.length > 0 && (
        <Chip
          label={
            auth.workspaces.find((w) => w.id === auth.workspaceId)?.name ??
            strings.context.workspace
          }
          onPress={() => setWsOpen(true)}
        />
      )}

      <PickerModal
        visible={orgOpen}
        title={strings.context.pickOrg}
        options={orgOptions}
        selectedId={auth.me?.orgId ?? null}
        onSelect={(id) => void auth.switchOrganization(id)}
        onClose={() => setOrgOpen(false)}
      />
      <PickerModal
        visible={groupOpen}
        title={strings.context.pickGroup}
        options={groupOptions}
        selectedId={auth.groupId}
        onSelect={(id) => void auth.setGroupId(id)}
        onClose={() => setGroupOpen(false)}
      />
      <PickerModal
        visible={wsOpen}
        title={strings.context.pickWorkspace}
        options={wsOptions}
        selectedId={auth.workspaceId}
        onSelect={(id) => auth.setWorkspaceId(id)}
        onClose={() => setWsOpen(false)}
      />
    </View>
  )
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  chip: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
})
