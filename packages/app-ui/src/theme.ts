/** Тема оформления: тёмная (mobile/chat) и светлая (web auth-карточка). */
export type UiTheme = 'dark' | 'light'

export const themeColors = {
  dark: {
    bg: '#0f1419',
    surface: '#1a2332',
    border: '#2d3a4f',
    text: '#e8edf4',
    textMuted: '#8b9cb3',
  },
  light: {
    bg: 'transparent',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
  },
} as const
