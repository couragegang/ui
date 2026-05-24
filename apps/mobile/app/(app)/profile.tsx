import { useRouter } from 'expo-router'
import { ProfileScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../../src/platform/bff'

export default function ProfileRoute() {
  const router = useRouter()
  return <ProfileScreen api={bffApi} onLogout={() => router.replace('/login')} />
}
