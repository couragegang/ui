import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@couragegang/design-system/tokens'

import { AppProviders } from '../src/providers/AppProviders'

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </AppProviders>
  )
}
