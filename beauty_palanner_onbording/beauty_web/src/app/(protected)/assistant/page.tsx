"use client"

import { useState } from 'react'
import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'

interface Msg { role: 'user' | 'assistant'; text: string }

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const next: Msg[] = [...messages, { role: 'user', text: input }]
    setMessages(next)
    setInput('')
    // Placeholder assistant echo
    setTimeout(() => setMessages((m) => [...m, { role: 'assistant', text: 'Thanks! I will help with that.' }]), 300)
  }

  return (
    <Protected>
      <PageContainer>
        <h1 className="text-2xl font-bold">Assistant</h1>
        <section className="card p-4 flex flex-col gap-3 max-w-2xl">
          <div className="min-h-[240px] space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <span className={`inline-block rounded px-3 py-2 ${m.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200'}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input input-bordered flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something…" />
            <button className="btn" onClick={send}>Send</button>
          </div>
        </section>
      </PageContainer>
    </Protected>
  )
}
