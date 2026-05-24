import { useMemo } from 'react'
import { Linking, Platform, StyleSheet } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { colors, fontSize, radius, spacing } from '@couragegang/design-system/tokens'

import { prepareChatMarkdownBody } from '../chat/message-content'

type Props = {
  content: string
  /** Меньший шрифт в bubble пользователя */
  compact?: boolean
}

function createMarkdownStyles(compact?: boolean) {
  const bodySize = compact ? fontSize.sm : fontSize.md
  const lineHeight = compact ? 22 : 24
  const mono = Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  })

  return StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: bodySize,
      lineHeight,
    },
    paragraph: {
      marginTop: 6,
      marginBottom: 6,
    },
    bullet_list: {
      marginTop: 6,
      marginBottom: 6,
    },
    ordered_list: {
      marginTop: 6,
      marginBottom: 6,
    },
    list_item: {
      marginTop: 3,
      marginBottom: 3,
    },
    bullet_list_icon: {
      marginLeft: 0,
      marginRight: 8,
      fontSize: bodySize,
      lineHeight,
      color: colors.text,
    },
    ordered_list_icon: {
      marginLeft: 0,
      marginRight: 8,
      fontSize: bodySize,
      lineHeight,
      color: colors.text,
    },
    bullet_list_content: {
      flex: 1,
      fontSize: bodySize,
      lineHeight,
      color: colors.text,
    },
    ordered_list_content: {
      flex: 1,
      fontSize: bodySize,
      lineHeight,
      color: colors.text,
    },
    text: {
      color: colors.text,
      fontSize: bodySize,
      lineHeight,
    },
    textgroup: {
      color: colors.text,
      fontSize: bodySize,
      lineHeight,
    },
    strong: {
      fontWeight: '600',
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.text,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: 'transparent',
      borderLeftWidth: 3,
      borderLeftColor: colors.border,
      borderColor: colors.border,
      marginLeft: 0,
      paddingLeft: spacing.sm + 4,
      marginVertical: 6,
    },
    code_inline: {
      fontFamily: mono,
      fontSize: 13,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
      color: colors.text,
    },
    code_block: {
      fontFamily: mono,
      fontSize: 13,
      lineHeight: 20,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: spacing.sm + 2,
      marginVertical: 6,
      color: colors.text,
    },
    fence: {
      fontFamily: mono,
      fontSize: 13,
      lineHeight: 20,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: spacing.sm + 2,
      marginVertical: 6,
      color: colors.text,
    },
    heading1: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      marginVertical: 6,
    },
    heading2: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginVertical: 6,
    },
    heading3: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      marginVertical: 4,
    },
    hr: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginVertical: spacing.sm,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      marginVertical: 6,
    },
    th: {
      fontWeight: '700',
      padding: spacing.sm,
      color: colors.text,
    },
    td: {
      padding: spacing.sm,
      color: colors.text,
    },
    tr: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
  })
}

export function ChatMessageContent({ content, compact }: Props) {
  const body = prepareChatMarkdownBody(content)
  const style = useMemo(() => createMarkdownStyles(compact), [compact])

  return (
    <Markdown
      style={style}
      mergeStyle
      onLinkPress={(url) => {
        void Linking.openURL(url)
        return false
      }}
    >
      {body}
    </Markdown>
  )
}
