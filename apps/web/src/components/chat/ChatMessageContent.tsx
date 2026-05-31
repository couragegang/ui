import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  content: string
}

/** Нормализует переносы, если бэкенд отдал литералы `\n`. */
function normalizeContent(text: string): string {
  return text.replace(/\\n/g, '\n')
}

/** Plain Notion URLs → markdown-ссылки для заметного клика. */
function linkifyNotionUrls(text: string): string {
  return text.replace(
    /(https:\/\/(?:[\w-]+\.)*notion\.(?:so|site)\/[^\s)\]]+)/gi,
    (url) => `[Открыть в Notion](${url})`,
  )
}

export function ChatMessageContent({ content }: Props) {
  const body = linkifyNotionUrls(normalizeContent(content))

  return (
    <div className="chat-markdown">
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
    </div>
  )
}
