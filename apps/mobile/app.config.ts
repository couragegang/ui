import type { ExpoConfig } from 'expo/config'

const apiBase =
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, '') ??
  'https://ai-test.valoriel.ru/api'

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Couragegang',
  slug: config.slug ?? 'couragegang-mobile',
  /** Версия для стора / TestFlight; поднимайте перед production build. */
  version: config.version ?? '0.0.1',
  ios: {
    ...config.ios,
    bundleIdentifier: config.ios?.bundleIdentifier ?? 'com.couragegang.app',
  },
  android: {
    ...config.android,
    package: config.android?.package ?? 'com.couragegang.app',
  },
  extra: {
    ...config.extra,
    apiBase,
  },
})
