import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ApiError, sendChat } from '../lib/api'

type Msg = { role: 'user' | 'assistant'; text: string; status?: string }

export function ChatPage() {
  const { t } = useTranslation()
  const { workspaceId } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || !workspaceId) return
    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await sendChat(userMsg)
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: res.reply, status: res.status },
      ])
      if (res.status === 'awaiting_approval') {
        setError(t('chat.awaitingApproval', { id: res.pendingApprovalId ?? '' }))
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.body ?? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!workspaceId) {
    return <p className="muted">{t('context.noWorkspace')}</p>
  }

  return (
    <div className="page chat-page">
      <h1>{t('nav.chat')}</h1>
      <div className="chat-log">
        {messages.length === 0 && <p className="muted">{t('chat.empty')}</p>}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <div className="chat-meta">{m.role === 'user' ? t('chat.you') : t('chat.agent')}</div>
            <div>{m.text}</div>
            {m.status && <div className="badge">{m.status}</div>}
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <form className="chat-input-row" onSubmit={onSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          disabled={loading}
        />
        <button type="submit" className="btn primary" disabled={loading || !input.trim()}>
          {t('chat.send')}
        </button>
      </form>
    </div>
  )
}
