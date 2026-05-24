/** Тема оформления: тёмная (mobile/chat) и светлая (web auth-карточка). */
export type UiTheme = 'dark' | 'light'

/** Общие цвета экрана входа (карточка на светлом фоне). */
export const authLayoutColors = {
  pageBg: '#f9fafb',
  cardBg: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  muted: '#6b7280',
  accent: '#4d6bfe',
} as const

export const themeColors = {
  dark: {
    bg: '#0f1419',
    surface: '#1a2332',
    border: '#2d3a4f',
    text: '#e8edf4',
    textMuted: '#8b9cb3',
  },
  light: {
    bg: '#f9fafb',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
  },
} as const
