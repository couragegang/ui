import { AuthScreen, type AuthScreenProps } from './AuthScreen'

export type RegisterScreenProps = Omit<AuthScreenProps, 'mode'>

/** @deprecated Используйте `AuthScreen` с `mode="register"`. */
export function RegisterScreen(props: RegisterScreenProps) {
  return <AuthScreen mode="register" {...props} />
}
