import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { AppProviders } from '../src/providers/AppProviders'

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1419' } }} />
    </AppProviders>
  )
}
