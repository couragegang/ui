import * as SecureStore from 'expo-secure-store'

const SKIP_KEY_PREFIX = 'onboarding:tools:skip:'

export async function isToolsOnboardingSkipped(workspaceId: string): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(`${SKIP_KEY_PREFIX}${workspaceId}`)) === '1'
  } catch {
    return false
  }
}

export async function skipToolsOnboarding(workspaceId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(`${SKIP_KEY_PREFIX}${workspaceId}`, '1')
  } catch {
    /* ignore */
  }
}
