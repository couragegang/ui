import { useTranslation } from 'react-i18next'

type Props = {
  title?: string
}

export function ChatEmptyWelcome({ title }: Props) {
  const { t } = useTranslation()

  return (
    <div className="chat-welcome">
      <div className="chat-welcome-logo" aria-hidden>
        <DeepseekMark />
      </div>
      <h2 className="chat-welcome-title">{title ?? t('chat.welcomeTitle')}</h2>
      <p className="chat-welcome-sub muted">{t('chat.welcomeSub')}</p>
    </div>
  )
}

function DeepseekMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#4D6BFE" />
      <path
        d="M12 26c4-8 12-12 16-14-4 2-8 6-10 10 2-1 6-2 10-2-6 4-10 8-16 6z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  )
}
