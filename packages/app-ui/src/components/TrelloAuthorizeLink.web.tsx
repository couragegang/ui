import { buildTrelloAuthorizeUrl } from '@couragegang/shared/trello'

import { strings } from '../strings'

export type TrelloAuthorizeLinkProps = {
  apiKey: string
  disabled?: boolean
}

export function TrelloAuthorizeLink({ apiKey, disabled }: TrelloAuthorizeLinkProps) {
  const url = buildTrelloAuthorizeUrl(apiKey)
  if (!url) return null

  return (
    <div className="trello-authorize-link">
      <p className="muted">{strings.mcp.trelloTokenHint}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn outline"
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {strings.mcp.trelloGetToken}
      </a>
      <p className="muted">{strings.mcp.trelloTokenPaste}</p>
    </div>
  )
}
