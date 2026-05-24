import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
})
