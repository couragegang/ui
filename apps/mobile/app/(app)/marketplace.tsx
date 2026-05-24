import { useRouter } from 'expo-router'
import { McpMarketplaceScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../../src/platform/bff'

export default function MarketplaceRoute() {
  const router = useRouter()
  return (
    <McpMarketplaceScreen
      api={bffApi}
      onInstalled={() => router.push('/(app)/connections')}
    />
  )
}
