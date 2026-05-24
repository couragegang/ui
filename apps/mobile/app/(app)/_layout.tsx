import { Redirect, Tabs } from 'expo-router'
import { useAuth } from '@couragegang/app-ui'
import { strings } from '@couragegang/app-ui'

export default function AppLayout() {
  const auth = useAuth()

  if (!auth.loading && !auth.me) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1a2332' },
        headerTintColor: '#e8edf4',
        tabBarStyle: { backgroundColor: '#1a2332', borderTopColor: '#2d3a4f' },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#8b9cb3',
      }}
    >
      <Tabs.Screen name="chat" options={{ title: strings.nav.chat }} />
      <Tabs.Screen name="connections" options={{ title: strings.nav.connections }} />
      <Tabs.Screen name="marketplace" options={{ title: strings.nav.marketplace }} />
      <Tabs.Screen name="profile" options={{ title: strings.nav.profile }} />
      <Tabs.Screen
        name="onboarding/tools"
        options={{ href: null, title: strings.onboarding.title }}
      />
    </Tabs>
  )
}
