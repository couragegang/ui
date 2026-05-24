import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'

/** Обёртка для RN-экранов в web (flex + высота внутри app-shell). */
export function RnHost({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.host, style]}>{children}</View>
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignSelf: 'stretch',
  },
})
