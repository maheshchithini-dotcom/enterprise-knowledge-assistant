import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Send, Trash2, Bot } from 'lucide-react'
import MessageBubble from '../components/MessageBubble'
import { sendMessage, clearSession } from '../api/client'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
     const res = await sendMessage({ question: userMsg.content, session_id: sessionId })
      const botMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: `⚠️ ${err.response?.data?.detail || 'Something went wrong. Please try again.'}`,
        sources: [],
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    await clearSession(sessionId).catch(() => {})
    setMessages([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div>
          <h2 className="text-white font-semibold">SOP Knowledge Assistant</h2>
          <p className="text-gray-400 text-xs">Ask questions about your company's procedures</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            <Trash2 size={15} /> Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">How can I help you today?</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Ask me anything about your company's SOPs, procedures, and policies. Upload documents first via the Documents page.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {[
                'What is the onboarding process for new employees?',
                'Explain the data backup procedure',
                'What are the steps for incident reporting?',
                'Summarize the IT security policy',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2.5 rounded-lg transition-colors border border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-700 bg-gray-900">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your SOP documents..."
            rows={1}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}