import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '@couragegang/shared/types'
import { ChatMessageContent } from './ChatMessageContent'

type Props = {
  message: ChatMessage
  onApprove?: () => void
  onReject?: () => void
  hitlBusy?: boolean
}

export function ChatMessageBubble({ message, onApprove, onReject, hitlBusy }: Props) {
  const { t } = useTranslation()
  const isUser = message.role === 'user'
  const awaiting =
    message.role === 'assistant' &&
    message.status === 'awaiting_approval' &&
    message.pendingApprovalId &&
    !message.hitlResolved

  const isError = message.status === 'error'
  const showStatus =
    message.status &&
    message.status !== 'completed' &&
    message.status !== 'ok' &&
    !isError

  return (
    <div
      className={`chat-row ${isUser ? 'chat-row--user' : 'chat-row--assistant'}${isError ? ' chat-row--error' : ''}`}
    >
      <div className="chat-row-inner">
        {!isUser && (
          <div className="chat-row-avatar" aria-hidden>
            <span>AI</span>
          </div>
        )}
        <div className="chat-row-content">
          {isUser ? (
            <div className="chat-user-bubble">
              <ChatMessageContent content={message.content} />
            </div>
          ) : (
            <ChatMessageContent content={message.content} />
          )}

          {showStatus && <div className="chat-status-badge">{message.status}</div>}

          {awaiting && (
            <div className="chat-hitl">
              <p className="muted">{t('chat.hitlPrompt')}</p>
              <div className="row gap">
                <button
                  type="button"
                  className="btn primary"
                  disabled={hitlBusy}
                  onClick={onApprove}
                >
                  {t('chat.approve')}
                </button>
                <button
                  type="button"
                  className="btn outline"
                  disabled={hitlBusy}
                  onClick={onReject}
                >
                  {t('chat.reject')}
                </button>
              </div>
            </div>
          )}
          {message.hitlResolved === 'approved' && (
            <p className="success">{t('chat.hitlApproved')}</p>
          )}
          {message.hitlResolved === 'rejected' && (
            <p className="muted">{t('chat.hitlRejected')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
