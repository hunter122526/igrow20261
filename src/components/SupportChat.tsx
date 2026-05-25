"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

type Msg = { from: 'user' | 'growi'; text: string }

export default function SupportChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()

  const SendLoader = () => (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 via-sky-500/10 to-transparent blur-sm" />
      <span className="relative block h-6 w-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.5)] transform-gpu animate-spin" />
    </span>
  )

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  const send = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setMessages(m => [...m, { from: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json()
      const reply = data?.reply || data?.message || data?.error || "I'm sorry, I can't answer that right now."
      setMessages(m => [...m, { from: 'growi', text: reply }])
    } catch (err) {
      setMessages(m => [...m, { from: 'growi', text: `Error: ${err?.message || 'failed to reach assistant.'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        {open && (
          <div className="w-[clamp(300px,95vw,430px)] max-w-md bg-slate-950/95 border border-slate-700 rounded-[28px] p-4 mb-2 shadow-[0_32px_80px_rgba(15,23,42,0.45)] backdrop-blur-none max-h-[80vh]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-white">Growi — Support</div>
              <button onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-white">Close</button>
            </div>
            <div className="relative">
              <div ref={listRef} className="h-[clamp(260px,45vh,520px)] overflow-y-auto mb-3 p-2 space-y-3 rounded-2xl bg-slate-900 border border-slate-800">
                {messages.length === 0 && <div className="text-xs text-slate-400">Hi — ask me anything about iGrow. This chat is AI-powered to help with support questions.</div>}
                {messages.map((m, i) => (
                  <div key={i} className={m.from === 'user' ? 'text-right' : 'text-left'}>
                    <div className={`inline-block px-3 py-2 rounded-2xl ${m.from === 'user' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-100'}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-slate-950/95 backdrop-blur-sm z-10">
                  <div className="relative w-32 h-32" style={{ perspective: '900px' }}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 via-sky-500/10 to-transparent blur-2xl" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative w-20 h-20 transform-gpu [transform-style:preserve-3d] animate-[spin_1.8s_linear_infinite]">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/80 to-sky-500/40 shadow-[0_0_60px_rgba(56,189,248,0.5)]" />
                        <div className="absolute inset-0 rounded-2xl border border-white/10" />
                        <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 rotate-45" />
                        <div className="absolute inset-0 rounded-2xl border border-sky-300/20 rotate-90" />
                        <div className="absolute inset-0 rounded-2xl border border-cyan-200/20 animate-[pulse_1.4s_ease-in-out_infinite]" />
                      </div>
                      <div className="absolute bottom-[-2rem] text-xs text-slate-300 uppercase tracking-[0.2em] font-semibold">
                        Loading AI response...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className="flex-1 rounded-2xl px-4 py-3 bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-primary" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Ask the AI support assistant..." />
              <button onClick={send} disabled={loading} className="h-12 rounded-2xl bg-primary text-white transition hover:brightness-110 disabled:opacity-50 flex items-center justify-center">
                {loading ? <SendLoader /> : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* 3D-like bot button */}
        <button onClick={() => setOpen(s => !s)} aria-label="Open Growi chat" className="w-16 h-16 rounded-full shadow-2xl relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6ee7b7,#3b82f6)' }}>
          <div className="absolute inset-0 rounded-full transform rotate-6" style={{ boxShadow: '0 12px 30px rgba(59,130,246,0.25), inset 0 -8px 18px rgba(0,0,0,0.15)' }} />
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="9" r="3" fill="#0f172a" />
              <circle cx="9" cy="8" r="0.9" fill="#ffffff" opacity="0.9" />
              <circle cx="15" cy="8" r="0.9" fill="#ffffff" opacity="0.9" />
              <path d="M8 14c1.333-1 3-1 4 0" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
