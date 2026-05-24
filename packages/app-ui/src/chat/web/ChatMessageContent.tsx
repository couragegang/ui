import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { prepareChatMarkdownBody } from '../message-content'

type Props = {
  content: string
}

const MarkdownWrap = 'div' as const

export function ChatMessageContent({ content }: Props) {
  const body = prepareChatMarkdownBody(content)

  return (
    <MarkdownWrap className="chat-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {body}
      </Markdown>
    </MarkdownWrap>
  )
}
