import { forwardRef, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  disabled?: boolean
  variant?: 'centered' | 'dock'
}

export const ChatComposer = forwardRef<HTMLTextAreaElement, Props>(function ChatComposer(
  { value, onChange, onSubmit, disabled, variant = 'dock' },
  ref,
) {
  const { t } = useTranslation()

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
          placeholder={t('chat.placeholder')}
          disabled={disabled}
          rows={variant === 'centered' ? 3 : 1}
          aria-label={t('chat.placeholder')}
        />
        <button
          type="submit"
          className="chat-composer-send"
          disabled={disabled || !value.trim()}
          aria-label={t('chat.send')}
        >
          <SendIcon />
        </button>
      </div>
      <p className="chat-composer-hint muted">{t('chat.composerHint')}</p>
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
