/** Compact date/time label for chat message footers. */
export function formatMessageTimestamp(iso: string | undefined, locale = 'ru-RU'): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const sameYear = date.getFullYear() === now.getFullYear()

  if (sameDay) {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  if (sameYear) {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function messageTimestampNow(): string {
  return new Date().toISOString()
}
