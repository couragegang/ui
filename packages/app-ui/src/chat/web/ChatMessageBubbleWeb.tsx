import type { ChatMessage } from '@couragegang/shared/types'
import { formatMessageTimestamp } from '@couragegang/shared/format-message-time'

import { strings } from '../../strings'
import { ChatMessageContent } from './ChatMessageContent'

type Props = {
  message: ChatMessage
  onApprove?: () => void
  onReject?: () => void
  hitlBusy?: boolean
}

export function ChatMessageBubbleWeb({ message, onApprove, onReject, hitlBusy }: Props) {
  const isUser = message.role === 'user'
  const isPlanApproval = message.status === 'awaiting_plan_approval'
  const awaiting =
    message.role === 'assistant' &&
    (message.status === 'awaiting_approval' || isPlanApproval) &&
    message.pendingApprovalId &&
    !message.hitlResolved

  const isError = message.status === 'error'
  const showStatus =
    message.status &&
    message.status !== 'completed' &&
    message.status !== 'ok' &&
    !isError &&
    !message.hitlResolved

  const timeLabel = formatMessageTimestamp(message.createdAt)

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
              <p className="muted">{strings.chat.hitlPrompt}</p>
              <div className="row gap">
                <button
                  type="button"
                  className="btn primary"
                  disabled={hitlBusy}
                  onClick={onApprove}
                >
                  {isPlanApproval ? strings.chat.approvePlan : strings.chat.approve}
                </button>
                <button
                  type="button"
                  className="btn outline"
                  disabled={hitlBusy}
                  onClick={onReject}
                >
                  {strings.chat.reject}
                </button>
              </div>
            </div>
          )}
          {message.hitlResolved === 'approved' && (
            <p className="success">{strings.chat.hitlApproved}</p>
          )}
          {message.hitlResolved === 'rejected' && (
            <p className="muted">{strings.chat.hitlRejected}</p>
          )}
          {timeLabel && (
            <time className="chat-message-time" dateTime={message.createdAt}>
              {timeLabel}
            </time>
          )}
        </div>
      </div>
    </div>
  )
}
