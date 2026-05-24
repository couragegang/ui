import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ModalSheetProps = {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** id для aria-labelledby */
  titleId?: string
  /** true — children внутри <form class="form modal-body"> */
  asForm?: boolean
  onSubmit?: (e: FormEvent) => void
}

export function ModalSheet({
  visible,
  title,
  onClose,
  children,
  titleId = 'modal-sheet-title',
  asForm = false,
  onSubmit,
}: ModalSheetProps) {
  if (!visible || typeof document === 'undefined') return null

  const body = asForm ? (
    <form className="form modal-body" onSubmit={onSubmit}>
      {children}
    </form>
  ) : (
    <div className="modal-body">{children}</div>
  )

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="btn ghost modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>
        {body}
      </div>
    </div>,
    document.body,
  )
}
