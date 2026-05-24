import type { OrganizationGroup } from './types'

export function pickDefaultGroupId(
  list: OrganizationGroup[],
  storedId?: string | null,
): string | null {
  if (list.length === 0) return null
  if (list.length === 1) return list[0].id
  if (storedId && list.some((g) => g.id === storedId)) return storedId
  const def = list.find((g) => g.isDefault)
  return def?.id ?? list[0].id
}
