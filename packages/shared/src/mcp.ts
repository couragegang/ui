import type {
  ConnectionFormField,
  ConnectionFormSchema,
  LocalizedLabel,
  PolicyRuleTemplate,
  PolicyTemplatePack,
} from './types'

export function localizedLabel(label: LocalizedLabel | undefined, fallback: string): string {
  if (!label) return fallback
  if (typeof label === 'string') return label
  return label.ru ?? label.en ?? fallback
}

export function emptyFormValues(schema?: ConnectionFormSchema): Record<string, string> {
  const values: Record<string, string> = {}
  for (const field of schema?.fields ?? []) {
    values[field.key] = ''
  }
  return values
}

/** Предзаполнение формы редактирования: config + пустые secret-поля. */
export function formValuesFromInstallation(
  schema: ConnectionFormSchema | undefined,
  config?: Record<string, string | number | boolean>,
): Record<string, string> {
  const values = emptyFormValues(schema)
  for (const field of schema?.fields ?? []) {
    if (field.storage === 'secret' || field.sensitive) {
      values[field.key] = ''
      continue
    }
    const raw = config?.[field.key]
    if (raw !== undefined && raw !== null) {
      values[field.key] = String(raw)
    }
  }
  return values
}

export type FormValidationOptions = {
  /** При редактировании: secret-поля не обязательны, если credentials уже есть */
  secretsOptional?: boolean
  secretsConfigured?: boolean
}

export function validateFormValues(
  schema: ConnectionFormSchema | undefined,
  values: Record<string, string>,
  options?: FormValidationOptions,
): string | null {
  for (const field of schema?.fields ?? []) {
    const isSecret = field.storage === 'secret' || field.sensitive
    if (
      options?.secretsOptional &&
      options.secretsConfigured &&
      isSecret &&
      !String(values[field.key] ?? '').trim()
    ) {
      continue
    }
    if (field.required && !String(values[field.key] ?? '').trim()) {
      return field.key
    }
  }
  return null
}

export type FormSubmitOptions = {
  /** Не отправлять пустые secret-поля (редактирование без смены токена) */
  omitEmptySecrets?: boolean
}

export function formValuesForSubmit(
  schema: ConnectionFormSchema | undefined,
  values: Record<string, string>,
  options?: FormSubmitOptions,
): Record<string, string> {
  const out: Record<string, string> = {}
  const fieldByKey = new Map((schema?.fields ?? []).map((f) => [f.key, f]))
  for (const [key, raw] of Object.entries(values)) {
    if (fieldByKey.size > 0 && !fieldByKey.has(key)) continue
    const trimmed = String(raw ?? '').trim()
    if (!trimmed) continue
    const field = fieldByKey.get(key)
    const isSecret = field && (field.storage === 'secret' || field.sensitive)
    if (options?.omitEmptySecrets && isSecret && !trimmed) continue
    out[key] = trimmed
  }
  return out
}

export function inputTypeForField(field: ConnectionFormField): string {
  if (field.widget === 'password' || field.sensitive) return 'password'
  return 'text'
}

export function canCustomizeMcpPolicy(permissions?: string[]): boolean {
  return Boolean(permissions?.includes('iam.member.manage'))
}

const EFFECT_LABELS: Record<string, string> = {
  allow_read: 'Чтение',
  allow: 'Разрешено',
  require_approval: 'Запись с подтверждением',
  deny_write: 'Запрет записи',
}

export function policyEffectLabel(effect: string): string {
  return EFFECT_LABELS[effect] ?? effect
}

export function clonePolicyPack(pack?: PolicyTemplatePack): PolicyTemplatePack {
  return {
    rules: (pack?.rules ?? []).map((r) => ({ ...r })),
  }
}

export function buildPolicyPackOptions(
  template: PolicyTemplatePack | undefined,
  connectorKey: string,
): PolicyTemplatePack[] {
  const base = clonePolicyPack(template)
  const readPattern = `mcp:${connectorKey}:*:read`
  const writePattern = `mcp:${connectorKey}:*:write`

  return [
    base,
    {
      rules: [
        { effect: 'allow_read', resource_pattern: readPattern, priority: 100 },
        { effect: 'require_approval', resource_pattern: writePattern, priority: 200 },
      ],
    },
    {
      rules: [{ effect: 'allow_read', resource_pattern: readPattern, priority: 100 }],
    },
  ]
}

export function policyPackSummary(rules: PolicyRuleTemplate[]): string {
  return rules.map((r) => `${policyEffectLabel(r.effect)} → ${r.resource_pattern}`).join('; ')
}
