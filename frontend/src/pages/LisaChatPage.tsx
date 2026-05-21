import { useState } from 'react'
import { getToken } from '../auth'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface LisaResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

export function LisaChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = getToken()

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!token) {
      setError('Please login to chat');
      return;
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${ALLOWED_HOST}:3000/lisa/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Error: ${response.status}`)
      }

      const data: LisaResponse = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'No response',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Chat with LISA</h1>
        <p>Authentication required to use Lisa chat</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Chat with LISA</h1>
      
      <div style={{ 
        flex: 1, 
        border: '1px solid #ccc', 
        borderRadius: 8, 
        padding: 16, 
        overflowY: 'auto',
        marginBottom: 16,
        minHeight: 400,
      }}>
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 16,
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: 16,
                background: msg.role === 'user' ? '#007bff' : '#e9ecef',
                color: msg.role === 'user' ? '#fff' : '#000',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px 14px', color: '#666' }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ccc', resize: 'none', minHeight: 60 }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#007bff', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
