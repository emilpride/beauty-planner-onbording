"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useTheme } from '@/hooks/useTheme'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { fetchAssistant, saveAssistant, type AssistantId } from '@/lib/userSettings'

type Assistant = 'Ellie' | 'Max'

const ASSISTANT_KEY = 'bm_ai_assistant'

// Creative, recognizable accent palettes grouped by category
type PaletteItem = { label: string; hex: string }
type PaletteGroup = { name: string; items: PaletteItem[] }

const PALETTES: PaletteGroup[] = [
  {
    name: 'Beauty Mirror',
    items: [
      { label: 'BM Purple', hex: '#A385E9' },
      { label: 'BM Deep Purple', hex: '#8B6BC9' },
      { label: 'BM Pink', hex: '#FFC0F7' },
      { label: 'BM Sky Blue', hex: '#7CC6FF' },
      { label: 'BM Coral', hex: '#FF6B6B' },
    ],
  },
  {
    name: 'Popular',
    items: [
      { label: 'Apple Blue', hex: '#0A84FF' },
      { label: 'Google Blue', hex: '#1A73E8' },
      { label: 'GitHub Blue', hex: '#0969DA' },
      { label: 'Stripe Purple', hex: '#635BFF' },
      { label: 'Twitter Blue', hex: '#1DA1F2' },
      { label: 'Slack Purple', hex: '#611F69' },
      { label: 'Brand Purple', hex: '#A385E9' },
    ],
  },
  {
    name: 'Social',
    items: [
      { label: 'Instagram Pink', hex: '#E1306C' },
      { label: 'Facebook Blue', hex: '#1877F2' },
      { label: 'Discord Blurple', hex: '#5865F2' },
      { label: 'Twitch Purple', hex: '#9146FF' },
      { label: 'YouTube Red', hex: '#FF0000' },
      { label: 'Reddit Orange', hex: '#FF4500' },
    ],
  },
  {
    name: 'Design',
    items: [
      { label: 'Figma Orange', hex: '#F24E1E' },
      { label: 'Linear Indigo', hex: '#5E6AD2' },
      { label: 'Asana Pink', hex: '#FF5263' },
      { label: 'Jira Blue', hex: '#0052CC' },
      { label: 'Trello Cyan', hex: '#0079BF' },
    ],
  },
  {
    name: 'Entertainment',
    items: [
      { label: 'Netflix Red', hex: '#E50914' },
      { label: 'Spotify Green', hex: '#1DB954' },
      { label: 'Amazon Orange', hex: '#FF9900' },
      { label: 'Disney+ Blue', hex: '#113CCF' },
      { label: 'Hulu Green', hex: '#1CE783' },
    ],
  },
  {
    name: 'Ecosystems',
    items: [
      { label: 'Apple Green', hex: '#32D74B' },
      { label: 'Apple Purple', hex: '#BF5AF2' },
      { label: 'Apple Pink', hex: '#FF375F' },
      { label: 'Google Green', hex: '#34A853' },
      { label: 'Google Yellow', hex: '#FBBC05' },
      { label: 'Google Red', hex: '#EA4335' },
    ],
  },
]

export default function AppearancePage() {
  const { mode, setMode, accent, setAccent } = useTheme()
  const { user } = useAuth()
  const [assistant, setAssistant] = useState<Assistant>('Ellie')
  // language moved to Language & Region page
  const [customAccent, setCustomAccent] = useState<string>(accent)
  const [paletteIndex, setPaletteIndex] = useState<number>(0)
  // precise sliding pill for palette tabs
  const paletteTabsRef = useRef<HTMLDivElement | null>(null)
  const paletteIndicatorRef = useRef<HTMLSpanElement | null>(null)
  const paletteButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [initialAssistantId, setInitialAssistantId] = useState<AssistantId | null>(null)
  const [savingAssistant, setSavingAssistant] = useState(false)
  const [saveResult, setSaveResult] = useState<'ok' | 'err' | null>(null)
  const [useFallbackArt, setUseFallbackArt] = useState(false)

  // load persisted assistant (prefer Firestore if logged in)
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        setCustomAccent(accent)

        const localA = (localStorage.getItem(ASSISTANT_KEY) as Assistant | null)

        if (user?.uid) {
          const id = await fetchAssistant(user.uid)
          if (!cancelled) {
            if (id === 1) { setAssistant('Max'); setInitialAssistantId(1) }
            else if (id === 2) { setAssistant('Ellie'); setInitialAssistantId(2) }
            else {
              // fallback to local or default Ellie
              const a = localA || 'Ellie'
              setAssistant(a)
              setInitialAssistantId(a === 'Max' ? 1 : 2)
            }
          }
        } else {
          const a = localA || 'Ellie'
          if (!cancelled) {
            setAssistant(a)
            setInitialAssistantId(a === 'Max' ? 1 : 2)
          }
        }
      } catch {
        const a = ((localStorage.getItem(ASSISTANT_KEY) as Assistant | null) || 'Ellie')
        if (!cancelled) {
          setAssistant(a)
          setInitialAssistantId(a === 'Max' ? 1 : 2)
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [accent, user?.uid])

  const themeLabel = useMemo(() => (mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'), [mode])

  const applyAssistant = (val: Assistant) => {
    setAssistant(val)
    try { localStorage.setItem(ASSISTANT_KEY, val) } catch {}
    setSaveResult(null)
  }
  // removed language preference handling from appearance

  const onPickAccent = (hex: string) => {
    setCustomAccent(hex)
    setAccent(hex)
  }

  const onCustomAccentBlur = () => {
    const hex = customAccent.trim()
    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
      const normalized = hex.startsWith('#') ? hex : `#${hex}`
      setAccent(normalized)
      setCustomAccent(normalized)
    }
  }

  const currentAssistantId: AssistantId = assistant === 'Max' ? 1 : 2
  const dirtyAssistant = initialAssistantId != null && currentAssistantId !== initialAssistantId

  const confirmAssistant = async () => {
    if (!user?.uid) {
      // Still persist locally even if not logged in (Protected should ensure auth, but just in case)
      try { localStorage.setItem(ASSISTANT_KEY, assistant) } catch {}
      setSaveResult('ok')
      setInitialAssistantId(currentAssistantId)
      return
    }
    setSavingAssistant(true)
    setSaveResult(null)
    try {
      await saveAssistant(user.uid, currentAssistantId)
      setInitialAssistantId(currentAssistantId)
      setSaveResult('ok')
    } catch (e) {
      setSaveResult('err')
    } finally {
      setSavingAssistant(false)
    }
  }

  // keep the palette tab highlight precisely aligned with the selected button
  useEffect(() => {
    const update = () => {
      const btn = paletteButtonRefs.current[paletteIndex]
      const indicator = paletteIndicatorRef.current
      const container = paletteTabsRef.current
      if (!btn || !indicator || !container) return
      const left = btn.offsetLeft
      const width = btn.offsetWidth
      indicator.style.transform = `translateX(${left}px)`
      indicator.style.width = `${width}px`
    }
    // run after paint for layout stability
    const raf = requestAnimationFrame(update)
    const resize = () => update()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [paletteIndex])

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[720px] mx-auto py-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link href="/preferences" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">App Appearance</h1>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-text-secondary font-semibold">Theme</div>
                  <div className="text-base md:text-lg font-bold text-text-primary">{themeLabel}</div>
                </div>
                <div className="flex gap-2">
                  {(['light','dark','system'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${mode===m? 'bg-[rgb(var(--accent))] text-white border-transparent':'bg-surface hover:bg-surface-hover border-border-subtle text-text-primary'}`}
                    >{m[0].toUpperCase()+m.slice(1)}</button>
                  ))}
                </div>
              </div>
            </section>

            {/* Accent Color */}
            <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-text-secondary font-semibold">Accent Color</div>
                  <div className="text-base md:text-lg font-bold text-text-primary">{accent}</div>
                </div>
              </div>
              {/* Palette group selector: dropdown on mobile, tabs on desktop */}
              <div className="mb-3">
                {/* Mobile: simple select */}
                <div className="sm:hidden">
                  <label className="sr-only" htmlFor="palette-group">Palette group</label>
                  <select
                    id="palette-group"
                    value={paletteIndex}
                    onChange={(e) => setPaletteIndex(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                  >
                    {PALETTES.map((p, i) => (
                      <option key={p.name} value={i}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {/* Desktop: tabs with sliding indicator */}
                <div
                  ref={paletteTabsRef}
                  role="tablist"
                  aria-label="Accent palettes"
                  className="relative hidden sm:inline-flex rounded-xl border border-border-subtle bg-surface p-1"
                >
                  {/* sliding pill that matches selected tab width and position */}
                  <span
                    ref={paletteIndicatorRef}
                    aria-hidden
                    className="absolute top-1 bottom-1 left-1 rounded-lg bg-[rgb(var(--accent))] transition-[transform,width] duration-300"
                    style={{ transform: 'translateX(0)', width: 0 }}
                  />
                  {PALETTES.map((p, i) => (
                    <button
                      key={p.name}
                      ref={(el) => { paletteButtonRefs.current[i] = el }}
                      role="tab"
                      aria-selected={paletteIndex===i}
                      onClick={() => setPaletteIndex(i)}
                      className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-lg ${paletteIndex===i? 'text-white':'text-text-primary hover:text-text-primary'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {PALETTES[paletteIndex]?.items.map(({ hex, label }) => {
                  const selected = accent.toUpperCase()===hex.toUpperCase()
                  return (
                    <button
                      key={hex}
                      onClick={() => onPickAccent(hex)}
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${label} (${hex})`}
                      title={`${label} (${hex})`}
                      className={`group inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition ${selected? 'border-transparent bg-[rgb(var(--accent))] text-white ring-2 ring-[rgb(var(--accent))]/30':'border-border-subtle bg-surface hover:bg-surface-hover text-text-primary'}`}
                    >
                      <span className="relative inline-flex h-4 w-4 items-center justify-center">
                        <span className="absolute inset-0 rounded-full border border-border-subtle shadow-sm" style={{ backgroundColor: hex }} />
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" className="relative text-white">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  )
                })}
                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                  <input
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    onBlur={onCustomAccentBlur}
                    placeholder="#A385E9"
                    className="h-9 w-full sm:w-36 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                  />
                  <span className="h-9 w-9 rounded-full border border-border-subtle" style={{ backgroundColor: customAccent }} />
                </div>
              </div>

              {/* Live preview */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="h-10 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: accent }}>Primary Button</button>
                <a className="h-10 rounded-lg text-sm font-medium grid place-items-center underline" style={{ color: accent }}>Accent Link</a>
                <div className="h-10 rounded-lg border border-border-subtle grid place-items-center">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="h-4 w-7 rounded-full bg-surface-hover relative">
                      <span className="absolute top-0.5 left-3 h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
                    </span>
                    Toggle
                  </span>
                </div>
              </div>
            </section>

            {/* AI Assistant */}
            <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-sm text-text-secondary font-semibold">AI assistant</div>
                <div className="text-base md:text-lg font-bold text-text-primary">{assistant}</div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden mb-4">
                <div
                  className="relative h-44 sm:h-52 w-full"
                  style={{
                    background:
                      assistant === 'Ellie'
                        ? 'radial-gradient(100% 80% at 70% 0%, rgba(255,192,247,0.9) 0%, rgba(255,192,247,0.0) 70%), radial-gradient(80% 60% at 0% 100%, rgba(163,133,233,0.6) 0%, rgba(163,133,233,0.0) 70%)'
                        : 'radial-gradient(100% 80% at 70% 0%, rgba(124,198,255,0.9) 0%, rgba(124,198,255,0.0) 70%), radial-gradient(80% 60% at 0% 100%, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.0) 70%)',
                  }}
                >
                  <div className="absolute inset-0 animate-[softFloat_8s_ease-in-out_infinite]" />
                  <Image
                    src={useFallbackArt ? '/icons/misc/assistant.png' : (assistant === 'Ellie' ? '/images/assistants/ellie.png' : '/images/assistants/max.png')}
                    alt="Assistant"
                    fill
                    sizes="(max-width: 768px) 60vw, 400px"
                    className="absolute bottom-0 right-2 h-[85%] w-auto object-contain pointer-events-none select-none"
                    style={{ inset: 'auto 0.5rem 0.25rem auto' }}
                    priority
                    onError={() => setUseFallbackArt(true)}
                  />
                  <div className="absolute left-3 top-3 rounded-lg px-2 py-1 text-xs md:text-sm text-white bg-black/30 backdrop-blur-sm">
                    {assistant === 'Ellie' ? 'Empathetic & friendly' : 'Confident & concise'}
                  </div>
                </div>
              </div>

              {/* Options as tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="ml-0">
                  <div
                    role="tablist"
                    aria-label="AI Assistant"
                    className="relative inline-flex w-full sm:w-[260px] max-w-full rounded-xl border border-border-subtle bg-surface shadow-sm"
                  >
                    {/* Sliding accent indicator */}
                    <span
                      aria-hidden
                      className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-[rgb(var(--accent))] transition-transform duration-300"
                      style={{ transform: assistant === 'Max' ? 'translateX(0)' : 'translateX(100%)' }}
                    />
                    <button
                      role="tab"
                      aria-selected={assistant === 'Max'}
                      onClick={() => applyAssistant('Max')}
                      className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium transition-colors ${assistant === 'Max' ? 'text-white' : 'text-text-primary hover:text-text-primary'}`}
                    >
                      Max
                    </button>
                    <button
                      role="tab"
                      aria-selected={assistant === 'Ellie'}
                      onClick={() => applyAssistant('Ellie')}
                      className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium transition-colors ${assistant === 'Ellie' ? 'text-white' : 'text-text-primary hover:text-text-primary'}`}
                    >
                      Ellie
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto">
                  {saveResult === 'ok' && (
                    <span className="text-sm text-green-600">Saved</span>
                  )}
                  {saveResult === 'err' && (
                    <span className="text-sm text-red-600">Failed to save</span>
                  )}
                  <button
                    onClick={confirmAssistant}
                    disabled={!dirtyAssistant || savingAssistant}
                    className={`px-4 h-10 rounded-lg text-sm font-medium border transition ${dirtyAssistant && !savingAssistant ? 'bg-[rgb(var(--accent))] text-white border-transparent shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_0_6px_rgba(var(--accent),0.2)]' : 'bg-surface border-border-subtle text-text-secondary cursor-default'}`}
                  >
                    {savingAssistant ? 'Saving…' : 'Confirm'}
                  </button>
                </div>
              </div>
            </section>

            {/* Language section moved to /account/language */}
          </div>
        </div>
      </PageContainer>
    </Protected>
  )
}
