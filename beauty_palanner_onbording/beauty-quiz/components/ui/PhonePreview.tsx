"use client"

import { motion } from 'framer-motion'

export default function PhonePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mx-auto w-full max-w-[380px]"
      aria-label="Preview of the app dashboard"
    >
      <div className="relative mx-auto aspect-[9/19.5] w-full rounded-[44px] bg-gradient-to-br from-[#0B1020] to-[#1B1F2B] p-[10px] shadow-[0_30px_60px_rgba(20,12,50,0.25)]">
        {/* Frame gloss */}
        <div className="pointer-events-none absolute inset-[6px] rounded-[38px] ring-1 ring-white/10" />
        {/* Dynamic island + status */}
        <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
          <div className="h-[34px] w-[124px] rounded-[22px] bg-[#030303]" />
        </div>
        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#F6F6F6]">
          {/* Gradient header backdrop */}
          <div className="pointer-events-none absolute -left-[145px] top-0 h-[320px] w-[720px]">
            <div className="absolute inset-0 bg-[linear-gradient(99.3deg,#F4EBFF_1.48%,#BCCAF7_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
          </div>

          {/* Content column */}
          <div className="relative z-10 mx-auto mt-[65px] flex w-[382px] max-w-full flex-col gap-4 px-4">
            {/* Top row: April + calendar icon */}
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              <p className="mx-auto text-[20px] font-bold tracking-tight text-[#5C4688]">April</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#5C4688]"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 15H5V9h14v10Z"/></svg>
              </div>
            </div>

            {/* Days scroller */}
            <div className="-mx-4 px-4">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {[
                  { d: '10', w: 'Tu', sel: false },
                  { d: '11', w: 'Fr', sel: false },
                  { d: '12', w: 'Sa', sel: true },
                  { d: '13', w: 'Su', sel: false },
                  { d: '14', w: 'Mo', sel: false },
                  { d: '15', w: 'Tu', sel: false },
                  { d: '16', w: 'We', sel: false },
                  { d: '17', w: 'Tu', sel: false },
                  { d: '18', w: 'Fr', sel: false }
                ].map(({ d, w, sel }) => (
                  <div key={d} className={`flex min-w-[46px] select-none flex-col items-center rounded-[28px] px-[13px] py-[12px] ${sel ? 'bg-[linear-gradient(191.39deg,#FFD2D2_8.51%,#8985E9_88.53%)] ring-2 ring-white/60 shadow-[0_8px_24px_-15px_#9CC8F0]' : 'bg-white/50'}`}>
                    <div className={`grid h-[30px] w-[30px] place-items-center rounded-full ${sel ? 'bg-white' : ''}`}>
                      <span className={`text-[14px] font-black ${sel ? 'text-[#8985E9]' : 'text-[#5C4688]'}`}>{d}</span>
                    </div>
                    <span className={`mt-1 text-[14px] font-medium ${sel ? 'text-white' : 'text-[#969AB7]'}`}>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmented control */}
            <div className="rounded-lg bg-white p-1 shadow-[0_8px_24.2px_-15px_#9CC8F0]">
              <div className="grid grid-cols-3 gap-4">
                {['Daily','Weekly','Overall'].map((t, i) => (
                  <div key={t} className={`mx-auto w-full max-w-[124px] rounded-lg py-3 text-center text-[12.6px] font-semibold ${i===0 ? 'bg-[#A385E9] text-white ring-2 ring-white' : 'text-[#969AB7]'}`}>{t}</div>
                ))}
              </div>
            </div>

            {/* Activities card with rings */}
            <div className="rounded-lg bg-white p-6 shadow-[0_12px_28px_rgba(10,8,20,0.07)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[20px] font-bold text-[#5C4688]">Activities</p>
                  <p className="text-[14px] font-semibold text-[#969AB7]">Your progress</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-[28px] font-semibold leading-[1] text-[#5C4688]">16</span>
                  <span className="pb-1 text-[11px] text-[#969AB7]">/24</span>
                </div>
              </div>
              <div className="mx-auto h-[208px] w-[208px]">
                <div className="relative h-full w-full">
                  {/* Outer Purple */}
                  <RingProgress size={208} thickness={18} value={72} color="#A162F7" bg="rgba(161,98,247,0.15)" />
                  {/* Orange */}
                  <RingProgress size={161} thickness={16} value={60} color="#FE7E07" bg="rgba(254,126,7,0.15)" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {/* Green */}
                  <RingProgress size={113} thickness={14} value={58} color="#2ACF56" bg="rgba(42,207,86,0.15)" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {/* Teal */}
                  <RingProgress size={64} thickness={12} value={62} color="#2AC4CF" bg="rgba(42,196,207,0.15)" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Horizontal stats cards */}
            <div className="-mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-2">
                <StatCard title="Skin Care" value="50/100%" color="#2AC4CF" />
                <StatCard title="Hair Care" value="75/100%" color="#2ACF56" />
                <StatCard title="Mental" value="40/100%" color="#FE7E07" />
                <StatCard title="Physics" value="90/100%" color="#A162F7" />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button className="rounded-lg border-4 border-white bg-[#A385E9] px-5 py-2 text-[14px] font-semibold text-white shadow-sm">All</button>
              <button className="rounded-lg bg-white px-5 py-2 text-[14px] font-semibold text-[#969AB7] shadow-sm">Morning</button>
              <button className="rounded-lg bg-white px-5 py-2 text-[14px] font-semibold text-[#969AB7] shadow-sm">Afternoon</button>
              <button className="rounded-lg bg-white px-5 py-2 text-[14px] font-semibold text-[#969AB7] shadow-sm">Evening</button>
            </div>

            {/* Schedule divider */}
            <SectionDivider title="Schedule" />

            {/* Schedule list */}
            <div className="flex flex-col gap-3">
              <ScheduleItem tint="rgba(0,128,255,0.2)" dot="#0080FF" title="Cleanse & Hydrate" time="7AM" />
              <ScheduleItem tint="rgba(255,0,29,0.2)" dot="#FF001D" title="Deep Hydration" time="8AM" />
              <ScheduleItem tint="rgba(246,255,0,0.2)" dot="#F7FF00" title="Exfoliate" time="9AM" />
              <ScheduleItem tint="rgba(178,255,0,0.2)" dot="#B3FF00" title="Face Massage" time="10AM" />
            </div>

            <SectionDivider title="Completed" />
            <div className="flex flex-col gap-3">
              <ScheduleItem tint="#E3E3E3" dot="#00FFFF" title="Wash & Care" time="7AM" muted />
              <ScheduleItem tint="#E3E3E3" dot="#4D00FF" title="Deep Nourishment" time="8AM" muted />
            </div>

            {/* bottom spacer */}
            <div className="h-[100px]" />
          </div>

          {/* Bottom nav */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-white/90 pb-3 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur">
            <div className="flex items-center gap-7">
              <div className="flex items-center gap-2 rounded-full bg-[#8682E4] px-3.5 py-2 text-white">
                <IconHome className="h-5 w-5" />
                <span className="text-[14px] font-medium">Home</span>
              </div>
              <IconSmiley className="h-6 w-6 text-[#969AB7]" />
              <IconActivity className="h-6 w-6 text-[#969AB7]" />
              <IconCategory className="h-6 w-6 text-[#969AB7]" />
              <IconProfile className="h-6 w-6 text-[#969AB7]" />
            </div>
            <div className="mt-2 h-1.5 w-[134px] rounded-full bg-[#35383F]" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RingProgress({ size, thickness, value, color, bg, className }: { size: number; thickness: number; value: number; color: string; bg: string; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        background: `conic-gradient(${color} ${clamped * 3.6}deg, ${bg} ${clamped * 3.6}deg)`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ width: size - thickness * 2, height: size - thickness * 2 }}
      />
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="relative h-[120px] w-[178px] min-w-[178px] rounded-lg bg-white shadow-sm">
      <div className="absolute left-2.5 top-2.5 flex items-center gap-2">
        <div className="grid h-[26px] w-[26px] place-items-center rounded-md" style={{ background: color }}>
          <span className="text-[12px] text-white">★</span>
        </div>
        <span className="text-[16.6px] font-medium text-[#5C4688]">{title}</span>
      </div>
      <div className="absolute left-1/2 top-[65px] -translate-x-1/2 text-[32px] font-medium leading-[38px] text-[#5C4688]">
        {value}
      </div>
    </div>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[14px] font-semibold text-[#969AB7]">{title}</span>
      <div className="h-px flex-1 bg-[#EEEEEE]" />
    </div>
  )
}

function ScheduleItem({ tint, dot, title, time, muted }: { tint: string; dot: string; title: string; time: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-full px-3 py-2" style={{ background: tint }}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full" style={{ background: dot }} />
        <div className="flex flex-col">
          <span className={`text-[16px] font-medium ${muted ? 'text-[#7B748A]' : 'text-[#5C4688]'}`}>{title}</span>
          <span className="text-[16px] text-[#969AB7]">{time}</span>
        </div>
      </div>
    </div>
  )
}

// Simple inline icons for bottom nav
function IconHome({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-9 9 9" />
      <path d="M9 21V9h6v12" />
    </svg>
  )
}

function IconSmiley({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
    </svg>
  )
}

function IconActivity({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconCategory({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconProfile({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
