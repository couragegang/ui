import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native'
import { colors, radius, spacing, fontSize } from '../tokens'

export type ButtonProps = PressableProps & {
  title: string
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  labelBase: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  labelPrimary: {
    color: '#fff',
  },
  labelSecondary: {
    color: colors.text,
  },
  labelGhost: {
    color: colors.primary,
  },
})

const variantStyles = {
  primary: {
    button: styles.primary,
    label: styles.labelPrimary,
    spinner: '#fff',
  },
  secondary: {
    button: styles.secondary,
    label: styles.labelSecondary,
    spinner: colors.text,
  },
  ghost: {
    button: styles.ghost,
    label: styles.labelGhost,
    spinner: colors.primary,
  },
} as const

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  const palette = variantStyles[variant]

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        palette.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as object,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.spinner} />
      ) : (
        <Text style={[styles.labelBase, palette.label]}>{title}</Text>
      )}
    </Pressable>
  )
}
