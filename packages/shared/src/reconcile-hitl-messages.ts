import type { ChatMessage } from './types'

export function isAwaitingHitlMessage(message: ChatMessage): boolean {
  return (
    message.role === 'assistant' &&
    (message.status === 'awaiting_approval' || message.status === 'awaiting_plan_approval') &&
    !!message.pendingApprovalId &&
    !message.hitlResolved
  )
}

/** Hide stale HITL prompts when the thread already has a later assistant reply. */
export function reconcileHitlFromThread(messages: ChatMessage[]): ChatMessage[] {
  const lastAwaitingIndex = messages.findLastIndex(isAwaitingHitlMessage)

  return messages.map((message, index) => {
    if (!isAwaitingHitlMessage(message)) return message

    const hasLaterAssistant = messages.slice(index + 1).some(
      (later) =>
        later.role === 'assistant' &&
        later.status !== 'awaiting_approval' &&
        later.status !== 'awaiting_plan_approval',
    )
    if (hasLaterAssistant) {
      return { ...message, hitlResolved: 'approved' }
    }

    if (lastAwaitingIndex >= 0 && index !== lastAwaitingIndex) {
      return { ...message, hitlResolved: 'approved' }
    }

    return message
  })
}

export type PendingApprovalLookup = (id: string) => Promise<{ status?: string } | null | undefined>

/** After reload, sync HITL buttons with policy pending status (approved/rejected/expired). */
export async function reconcileHitlWithPolicy(
  messages: ChatMessage[],
  lookupPending: PendingApprovalLookup,
): Promise<ChatMessage[]> {
  const fromThread = reconcileHitlFromThread(messages)
  const pendingIds = [
    ...new Set(
      fromThread
        .filter(isAwaitingHitlMessage)
        .map((m) => m.pendingApprovalId)
        .filter((id): id is string => !!id),
    ),
  ]
  if (pendingIds.length === 0) return fromThread

  const statusById = new Map<string, string>()
  await Promise.all(
    pendingIds.map(async (id) => {
      try {
        const row = await lookupPending(id)
        statusById.set(id, row?.status ?? 'missing')
      } catch {
        statusById.set(id, 'missing')
      }
    }),
  )

  return fromThread.map((message) => {
    if (!isAwaitingHitlMessage(message) || !message.pendingApprovalId) return message
    const status = statusById.get(message.pendingApprovalId)
    if (status === 'approved') return { ...message, hitlResolved: 'approved' }
    if (status === 'rejected') return { ...message, hitlResolved: 'rejected' }
    if (status === 'missing') return { ...message, hitlResolved: 'rejected' }
    return message
  })
}
