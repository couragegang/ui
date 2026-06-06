import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import type { ConnectionFormField, ConnectionFormSchema } from '@couragegang/shared/types'
import { inputTypeForField, localizedLabel } from '@couragegang/shared/mcp'

import { TextField } from './TextField'

export type ConnectionFormFieldsProps = {
  schema?: ConnectionFormSchema
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
  secretPlaceholder?: string
  renderAfterField?: (field: ConnectionFormField, values: Record<string, string>) => ReactNode
}

export function ConnectionFormFields({
  schema,
  values,
  onChange,
  disabled,
  secretPlaceholder,
  renderAfterField,
}: ConnectionFormFieldsProps) {
  const fields = schema?.fields ?? []
  if (fields.length === 0) {
    return <Text variant="muted">Нет полей подключения для этого инструмента.</Text>
  }

  return (
    <View style={styles.wrap}>
      {fields.map((field) => {
        const label = localizedLabel(field.label, field.key)
        const isSecret = inputTypeForField(field) === 'password'
        const required = field.required && !(isSecret && secretPlaceholder)
        const suffix = required ? ' *' : ''
        const multiline = field.widget === 'textarea'

        if (multiline) {
          return (
            <View key={field.key} style={styles.field}>
              <TextField
                label={`${label}${suffix}`}
                value={values[field.key] ?? ''}
                onChangeText={(v) => onChange(field.key, v)}
                secureTextEntry={false}
                editable={!disabled}
              />
              {renderAfterField?.(field, values)}
            </View>
          )
        }

        return (
          <View key={field.key} style={styles.field}>
            <TextField
              label={`${label}${suffix}`}
              value={values[field.key] ?? ''}
              onChangeText={(v) => onChange(field.key, v)}
              secureTextEntry={isSecret}
              placeholder={isSecret ? secretPlaceholder : localizedLabel(field.placeholder, field.key)}
              editable={!disabled}
            />
            {renderAfterField?.(field, values)}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  field: { gap: spacing.sm },
})
