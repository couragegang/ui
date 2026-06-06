import { Linking, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import { buildTrelloAuthorizeUrl } from '@couragegang/shared/trello'

import { strings } from '../strings'

export type TrelloAuthorizeLinkProps = {
  apiKey: string
  disabled?: boolean
}

export function TrelloAuthorizeLink({ apiKey, disabled }: TrelloAuthorizeLinkProps) {
  const url = buildTrelloAuthorizeUrl(apiKey)
  if (!url) return null

  return (
    <View style={styles.wrap}>
      <Text variant="muted">{strings.mcp.trelloTokenHint}</Text>
      <Pressable
        accessibilityRole="link"
        disabled={disabled}
        style={({ pressed }) => [styles.link, pressed && styles.pressed, disabled && styles.disabled]}
        onPress={() => void Linking.openURL(url)}
      >
        <Text variant="body">{strings.mcp.trelloGetToken}</Text>
      </Pressable>
      <Text variant="muted">{strings.mcp.trelloTokenPaste}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
})
