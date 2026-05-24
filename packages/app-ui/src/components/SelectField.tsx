import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

import { PickerModal, type PickerOption } from './PickerModal'

export type SelectFieldProps = {
  label: string
  value: string
  options: PickerOption[]
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Выберите…',
  disabled,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const selectedLabel = options.find((o) => o.id === value)?.label

  return (
    <View style={styles.wrap}>
      <Text variant="muted">{label}</Text>
      <Pressable
        style={[styles.input, disabled && styles.disabled]}
        onPress={() => !disabled && setOpen(true)}
      >
        <Text style={styles.value}>{selectedLabel ?? placeholder}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      <PickerModal
        visible={open}
        title={label}
        options={options}
        selectedId={value || null}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  disabled: { opacity: 0.5 },
  value: { color: colors.text, fontSize: fontSize.md, flex: 1 },
  chevron: { color: colors.textMuted, fontSize: 10 },
})
