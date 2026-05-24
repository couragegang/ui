import { StyleSheet, TextInput, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'
import { themeColors, type UiTheme } from '../theme'

export type TextFieldProps = {
  label: string
  value: string
  onChangeText: (v: string) => void
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address'
  placeholder?: string
  editable?: boolean
  theme?: UiTheme
}

export function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  placeholder,
  editable = true,
  theme = 'light',
}: TextFieldProps) {
  const pal = themeColors[theme]
  return (
    <View style={styles.wrap}>
      <Text variant="muted" style={{ color: pal.textMuted }}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: pal.surface,
            borderColor: pal.border,
            color: pal.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={pal.textMuted}
        editable={editable}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 44,
  },
})
