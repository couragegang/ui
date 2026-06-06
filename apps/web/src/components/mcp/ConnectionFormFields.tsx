import type { ReactNode } from 'react'
import type { ConnectionFormField, ConnectionFormSchema } from '@couragegang/shared/types'
import { inputTypeForField, localizedLabel } from '@couragegang/shared/mcp'

type Props = {
  schema?: ConnectionFormSchema
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
  /** Placeholder для secret-полей при редактировании */
  secretPlaceholder?: string
  renderAfterField?: (field: ConnectionFormField, values: Record<string, string>) => ReactNode
}

export function ConnectionFormFields({ schema, values, onChange, disabled, secretPlaceholder, renderAfterField }: Props) {
  const fields = schema?.fields ?? []
  if (fields.length === 0) {
    return <p className="muted">Нет полей подключения для этого инструмента.</p>
  }

  return (
    <>
      {fields.map((field) => {
        const label = localizedLabel(field.label, field.key)
        const type = inputTypeForField(field)
        const multiline = field.widget === 'textarea'
        const isSecret = type === 'password'
        const required = field.required && !(isSecret && secretPlaceholder)
        const placeholder = isSecret
          ? secretPlaceholder
          : localizedLabel(field.placeholder, undefined)
        return (
          <div key={field.key} className="connection-form-field">
            <label>
              {label}
              {required ? ' *' : ''}
              {multiline ? (
                <textarea
                  value={values[field.key] ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  required={required}
                  disabled={disabled}
                  rows={3}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type={type}
                  value={values[field.key] ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  required={required}
                  disabled={disabled}
                  placeholder={placeholder}
                  autoComplete={type === 'password' ? 'off' : undefined}
                />
              )}
            </label>
            {renderAfterField?.(field, values)}
          </div>
        )
      })}
    </>
  )
}
