import { StyleSheet, TextInput, View } from 'react-native'
import { Button } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

import { strings } from '../strings'

export type ChatInputProps = {
  value: string
  onChangeText: (v: string) => void
  onSend: () => void
  onFocus?: () => void
  disabled?: boolean
}

export function ChatInput({ value, onChangeText, onSend, onFocus, disabled }: ChatInputProps) {
  return (
    <View style={styles.dock}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={strings.chat.placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!disabled}
      />
      <Button title={strings.chat.send} onPress={onSend} disabled={disabled || !value.trim()} />
    </View>
  )
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.chatMain,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
  },
})
