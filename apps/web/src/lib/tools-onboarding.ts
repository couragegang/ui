const SKIP_KEY_PREFIX = 'onboarding:tools:skip:'

export function isToolsOnboardingSkipped(workspaceId: string): boolean {
  try {
    return localStorage.getItem(`${SKIP_KEY_PREFIX}${workspaceId}`) === '1'
  } catch {
    return false
  }
}

export function skipToolsOnboarding(workspaceId: string): void {
  try {
    localStorage.setItem(`${SKIP_KEY_PREFIX}${workspaceId}`, '1')
  } catch {
    /* ignore */
  }
}

export function clearToolsOnboardingSkip(workspaceId: string): void {
  try {
    localStorage.removeItem(`${SKIP_KEY_PREFIX}${workspaceId}`)
  } catch {
    /* ignore */
  }
}
