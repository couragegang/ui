import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PolicyTemplatePack } from '@couragegang/shared/types'
import {
  buildPolicyPackOptions,
  canCustomizeMcpPolicy,
  policyEffectLabel,
  policyPackSummary,
} from '@couragegang/shared/mcp'

type Props = {
  connectorKey: string
  template?: PolicyTemplatePack
  value: PolicyTemplatePack
  onChange: (pack: PolicyTemplatePack) => void
  permissions?: string[]
}

export function PolicyPackSection({
  connectorKey,
  template,
  value,
  onChange,
  permissions,
}: Props) {
  const { t } = useTranslation()
  const canEdit = canCustomizeMcpPolicy(permissions)
  const options = useMemo(
    () => buildPolicyPackOptions(template, connectorKey),
    [template, connectorKey],
  )

  const rules = value.rules ?? []

  return (
    <fieldset className="policy-section">
      <legend>{t('mcp.policyTitle')}</legend>
      {!canEdit && <p className="muted">{t('mcp.policyReadOnly')}</p>}
      {canEdit ? (
        <label>
          {t('mcp.policyPreset')}
          <select
            className="select"
            value={selectedPresetIndex(options, value)}
            onChange={(e) => {
              const idx = Number(e.target.value)
              if (options[idx]) onChange(options[idx])
            }}
          >
            {options.map((_opt, i) => (
              <option key={i} value={i}>
                {presetLabel(i, t)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <ul className="policy-rules">
        {rules.map((rule, i) => (
          <li key={`${rule.effect}-${rule.resource_pattern}-${i}`}>
            <span className="badge">{policyEffectLabel(rule.effect)}</span>
            <span className="muted">{rule.resource_pattern}</span>
          </li>
        ))}
      </ul>
      {rules.length > 0 && (
        <p className="muted policy-summary">{policyPackSummary(rules)}</p>
      )}
    </fieldset>
  )
}

function selectedPresetIndex(options: PolicyTemplatePack[], value: PolicyTemplatePack): number {
  const current = JSON.stringify(value.rules ?? [])
  const idx = options.findIndex((o) => JSON.stringify(o.rules ?? []) === current)
  return idx >= 0 ? idx : 0
}

function presetLabel(index: number, t: (key: string) => string): string {
  if (index === 0) return t('mcp.policyDefault')
  if (index === 1) return t('mcp.policyReadWriteApproval')
  return t('mcp.policyPresetReadOnly')
}
