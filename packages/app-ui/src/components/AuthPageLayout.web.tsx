import type { ReactNode } from 'react'

import type { AuthPageLayoutProps } from './AuthPageLayout'

export type { AuthPageLayoutProps }

/** Web: те же CSS-классы, что и в apps/web (градиент + карточка). */
export function AuthPageLayout({ title, subtitle, children, footer }: AuthPageLayoutProps) {
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
        {subtitle ? <p className="auth-card-subtitle muted">{subtitle}</p> : null}
        <div className="auth-card-body">{children}</div>
        {footer ? <footer className="auth-card-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
