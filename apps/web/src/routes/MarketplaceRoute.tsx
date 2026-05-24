import { useNavigate } from 'react-router-dom'
import { McpMarketplaceScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../platform/bff'

export function MarketplaceRoute() {
  const navigate = useNavigate()
  return <McpMarketplaceScreen api={bffApi} onInstalled={() => navigate('/connections')} />
}
