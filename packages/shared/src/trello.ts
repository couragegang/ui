export type TrelloAuthorizeOptions = {
  appName?: string
  scope?: string
}

/** Trello user-token authorize URL (token is returned in the page URL fragment). */
export function buildTrelloAuthorizeUrl(
  apiKey: string,
  options?: TrelloAuthorizeOptions,
): string | null {
  const key = apiKey.trim()
  if (!key) return null
  const params = new URLSearchParams({
    expiration: 'never',
    name: options?.appName ?? 'Courage Gang',
    scope: options?.scope ?? 'read,write',
    response_type: 'token',
    key,
  })
  return `https://trello.com/1/authorize?${params.toString()}`
}