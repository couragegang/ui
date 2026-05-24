import { Redirect, useRouter } from 'expo-router'
import { ToolsOnboardingScreen } from '@couragegang/app-ui/screens'
import { useAuth } from '@couragegang/app-ui'

import { bffApi } from '../../../src/platform/bff'

export default function ToolsOnboardingRoute() {
  const router = useRouter()
  const auth = useAuth()

  if (!auth.loading && !auth.me) {
    return <Redirect href="/login" />
  }

  return (
    <ToolsOnboardingScreen
      api={bffApi}
      onContinue={() => router.replace('/(app)/chat')}
      onOpenMarketplace={() => router.push('/(app)/marketplace')}
    />
  )
}
