import { useRouter } from 'expo-router'
import { McpMarketplaceScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../../src/platform/bff'

export default function McpRoute() {
  const router = useRouter()
  return (
    <McpMarketplaceScreen
      api={bffApi}
      hideHeader
      onInstalled={() => router.push('/connections')}
    />
  )
}
