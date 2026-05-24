import { forwardRef, type FormEvent, type KeyboardEvent } from 'react'

import { strings } from '../../strings'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  disabled?: boolean
  variant?: 'centered' | 'dock'
}

export const ChatComposerWeb = forwardRef<HTMLTextAreaElement, Props>(function ChatComposerWeb(
  { value, onChange, onSubmit, disabled, variant = 'dock' },
  ref,
) {
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSubmit(e as unknown as FormEvent)
      }
    }
  }

  return (
    <form
      className={`chat-composer ${variant === 'centered' ? 'chat-composer--centered' : 'chat-composer--dock'}`}
      onSubmit={onSubmit}
    >
      <div className="chat-composer-box">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={strings.chat.placeholder}
          disabled={disabled}
          rows={variant === 'centered' ? 3 : 1}
          aria-label={strings.chat.placeholder}
        />
        <button
          type="submit"
          className="chat-composer-send"
          disabled={disabled || !value.trim()}
          aria-label={strings.chat.send}
        >
          <SendIcon />
        </button>
      </div>
      <p className="chat-composer-hint muted">{strings.chat.composerHint}</p>
    </form>
  )
})

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4L10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
        transform="rotate(-90 12 12)"
      />
    </svg>
  )
}
