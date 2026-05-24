import { AuthScreen, type AuthScreenProps } from './AuthScreen'

export type LoginScreenProps = Omit<AuthScreenProps, 'mode'>

/** @deprecated Используйте `AuthScreen` с `mode="login"`. */
export function LoginScreen(props: LoginScreenProps) {
  return <AuthScreen mode="login" {...props} />
}
