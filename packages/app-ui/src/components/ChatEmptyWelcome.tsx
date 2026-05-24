import { StyleSheet, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { Text } from '@couragegang/design-system'
import { colors, spacing } from '@couragegang/design-system/tokens'

import { strings } from '../strings'

type Props = {
  title?: string
}

export function ChatEmptyWelcome({ title }: Props) {
  return (
    <View style={styles.wrap}>
      <DeepseekMark />
      <Text style={styles.title}>{title ?? strings.chat.welcomeTitle}</Text>
      <Text variant="muted" style={styles.sub}>
        {strings.chat.welcomeSub}
      </Text>
    </View>
  )
}

function DeepseekMark() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" accessibilityRole="image">
      <Rect width={40} height={40} rx={12} fill="#4D6BFE" />
      <Path
        d="M12 26c4-8 12-12 16-14-4 2-8 6-10 10 2-1 6-2 10-2-6 4-10 8-16 6z"
        fill="white"
        opacity={0.95}
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sub: { textAlign: 'center', lineHeight: 21 },
})
