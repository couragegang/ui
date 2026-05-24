import { useWorkspaceInstallations as useWorkspaceInstallationsBase } from '@couragegang/shared/hooks'

import { bffApi } from '../platform/bff'

export function useWorkspaceInstallations(workspaceId: string | null) {
  return useWorkspaceInstallationsBase(bffApi, workspaceId)
}
