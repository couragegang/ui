import type { BffMe } from './types'

export const IAM = {
  ORG_READ: 'iam.org.read',
  ORG_UPDATE: 'iam.org.update',
  GROUP_READ: 'iam.group.read',
  GROUP_MANAGE: 'iam.group.manage',
  MEMBER_READ: 'iam.member.read',
  MEMBER_INVITE: 'iam.member.invite',
  MEMBER_MANAGE: 'iam.member.manage',
} as const

export const ORG_ROLE_OPTIONS = ['member', 'admin', 'viewer'] as const
export const GROUP_ROLE_OPTIONS = ['member', 'admin', 'viewer'] as const

export function hasPermission(me: BffMe | null | undefined, permission: string): boolean {
  return me?.permissions?.includes(permission) ?? false
}
