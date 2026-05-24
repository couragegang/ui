import { useNavigate } from 'react-router-dom'
import { McpConnectionsScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../platform/bff'

export function ConnectionsRoute() {
  const navigate = useNavigate()
  return <McpConnectionsScreen api={bffApi} onAddMore={() => navigate('/mcp')} />
}
