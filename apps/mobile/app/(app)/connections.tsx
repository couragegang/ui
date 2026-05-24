import { useRouter } from 'expo-router'
import { McpConnectionsScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../../src/platform/bff'

export default function ConnectionsRoute() {
  const router = useRouter()
  return (
    <McpConnectionsScreen api={bffApi} hideHeader onAddMore={() => router.push('/mcp')} />
  )
}
