import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing } from '@couragegang/design-system/tokens'

import { strings } from '../strings'

export type PickerOption = { id: string; label: string }

export type PickerModalProps = {
  visible: boolean
  title: string
  options: PickerOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

export function PickerModal({ visible, title, options, selectedId, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text variant="title" style={styles.title}>
            {title}
          </Text>
          <ScrollView style={styles.list}>
            {options.map((o) => (
              <Pressable
                key={o.id}
                style={[styles.row, o.id === selectedId && styles.rowSelected]}
                onPress={() => {
                  onSelect(o.id)
                  onClose()
                }}
              >
                <Text style={o.id === selectedId ? styles.rowTextSelected : undefined}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text variant="muted">{strings.common.cancel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  title: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: { maxHeight: 360 },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowSelected: { backgroundColor: colors.surfaceHover },
  rowTextSelected: { color: colors.primary, fontWeight: '600' },
  cancel: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
})
