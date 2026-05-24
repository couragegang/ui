import type { ReactNode } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing } from '@couragegang/design-system/tokens'

export type ModalSheetProps = {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function ModalSheet({ visible, title, onClose, children }: ModalSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text variant="title" style={styles.title}>
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, fontSize: 18 },
  close: { fontSize: 28, color: colors.textMuted, lineHeight: 28 },
  body: { padding: spacing.lg, gap: spacing.md },
})
