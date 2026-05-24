import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="auth-page">
      <div className="auth-page-bg" aria-hidden />
      <div className="auth-card">
        <header className="auth-card-brand">
          <span className="auth-card-logo" aria-hidden>
            CG
          </span>
          <span className="auth-card-product">Courage Gang</span>
        </header>
        <h1 className="auth-card-title">{title}</h1>
        {subtitle && <p className="auth-card-subtitle muted">{subtitle}</p>}
        <div className="auth-card-body">{children}</div>
        {footer && <footer className="auth-card-footer">{footer}</footer>}
      </div>
    </div>
  )
}

export function AuthDivider() {
  const { t } = useTranslation()
  return (
    <div className="auth-divider" role="separator">
      <span className="auth-divider-line" />
      <span className="auth-divider-label">{t('auth.orDivider')}</span>
      <span className="auth-divider-line" />
    </div>
  )
}
