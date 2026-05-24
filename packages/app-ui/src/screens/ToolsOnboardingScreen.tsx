import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { useWorkspaceInstallations } from '@couragegang/shared/hooks'

import { Screen } from '../components/Screen'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type ToolsOnboardingScreenProps = {
  api: BffApi
  onContinue: () => void
  onOpenMarketplace: () => void
}

export function ToolsOnboardingScreen({ api, onContinue, onOpenMarketplace }: ToolsOnboardingScreenProps) {
  const { workspaceId } = useAuth()
  const { hasTools, loading } = useWorkspaceInstallations(api, workspaceId)

  return (
    <Screen>
      <Text variant="title">{strings.onboarding.title}</Text>
      <Text variant="muted">{strings.onboarding.subtitle}</Text>
      <View style={styles.actions}>
        <Button title={strings.onboarding.toMarketplace} onPress={onOpenMarketplace} />
        <Button
          title={hasTools ? 'Продолжить' : strings.onboarding.skip}
          variant="secondary"
          onPress={onContinue}
          disabled={loading}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  actions: { marginTop: spacing.lg, gap: spacing.md },
})
