import { useTranslation } from 'react-i18next'
import { buildTrelloAuthorizeUrl } from '@couragegang/shared/trello'

type Props = {
  apiKey: string
  disabled?: boolean
}

export function TrelloAuthorizeLink({ apiKey, disabled }: Props) {
  const { t } = useTranslation()
  const url = buildTrelloAuthorizeUrl(apiKey)
  if (!url) return null

  return (
    <div className="trello-authorize-link">
      <p className="muted">{t('mcp.trelloTokenHint')}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn outline"
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {t('mcp.trelloGetToken')}
      </a>
      <p className="muted">{t('mcp.trelloTokenPaste')}</p>
    </div>
  )
}
