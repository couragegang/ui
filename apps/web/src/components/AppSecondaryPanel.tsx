import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

type Props = {
  titleKey: string
  children: ReactNode
}

export function AppSecondaryPanel({ titleKey, children }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') navigate('/chat')
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  return (
    <div className="app-secondary" role="dialog" aria-modal="true" aria-labelledby="app-secondary-title">
      <header className="app-secondary-head">
        <button
          type="button"
          className="app-secondary-back"
          onClick={() => navigate('/chat')}
        >
          <BackIcon />
          <span>{t('app.backToChat')}</span>
        </button>
        <h1 id="app-secondary-title" className="app-secondary-title">
          {t(titleKey)}
        </h1>
      </header>
      <div className="app-secondary-body">{children}</div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
