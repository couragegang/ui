import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function ToolsOnboardingPanel({ children }: Props) {
  return (
    <div className="app-onboarding" role="dialog" aria-modal="true">
      <div className="app-onboarding-inner">{children}</div>
    </div>
  )
}
