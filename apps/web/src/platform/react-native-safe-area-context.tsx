import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'

type SafeAreaProps = ViewProps & { children?: ReactNode }

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  return children
}

export function SafeAreaView({ children, style, ...rest }: SafeAreaProps) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  )
}

export function useSafeAreaInsets() {
  return { top: 0, right: 0, bottom: 0, left: 0 }
}
