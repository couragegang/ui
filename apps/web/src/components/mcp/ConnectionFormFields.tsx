import type { ConnectionFormSchema } from '@couragegang/shared/types'
import { inputTypeForField, localizedLabel } from '@couragegang/shared/mcp'

type Props = {
  schema?: ConnectionFormSchema
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
  /** Placeholder для secret-полей при редактировании */
  secretPlaceholder?: string
}

export function ConnectionFormFields({ schema, values, onChange, disabled, secretPlaceholder }: Props) {
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
          <label key={field.key}>
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
        )
      })}
    </>
  )
}
