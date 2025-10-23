import type { TaskInstance } from '@/types/task'
import { useState } from 'react'
import Image from 'next/image'

const ICON_STYLES = [
  { icon: '/icons/activities/cleanseAndHydrate.svg', bg: '#0080FF' },      // Синий
  { icon: '/icons/activities/deepHydration.svg', bg: '#FF69B4' },          // Розовый
  { icon: '/icons/activities/exfoliate.svg', bg: '#FFD700' },              // Жёлтый
  { icon: '/icons/activities/faceMassage.svg', bg: '#90EE90' },            // Светло-зелёный
  { icon: '/icons/activities/washCare.svg', bg: '#00CED1' },               // Светло-голубой
  { icon: '/icons/activities/deepNourishment.svg', bg: '#4B0082' },        // Индиго/Фиолетовый
  { icon: '/icons/activities/scalpDetox.svg', bg: '#FF1493' },             // Ярко-розовый/Магента
  { icon: '/icons/activities/scalpMassage.svg', bg: '#FF7F50' },           // Коралловый
]

export function ActivityCards({ title, items }: { title: string; items: TaskInstance[] }) {
  const [collapsed, setCollapsed] = useState(title !== 'Planned')

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <h3 className="text-text-secondary text-sm font-semibold">{title}</h3>
        <span className="text-text-secondary text-xs">▶</span>
      </div>

      {!collapsed && (
        <div className="space-y-2">
          {items.map((t, idx) => {
            const iconStyle = ICON_STYLES[idx % ICON_STYLES.length]
            const time = t.time ? `${String(t.time.hour).padStart(2, '0')}:${String(t.time.minute || 0).padStart(2, '0')}` : '7AM'
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-[100px] px-3 py-2.5 bg-surface-hover"
              >
                <div
                  className="h-[48px] w-[48px] rounded-full grid place-items-center text-white text-xl font-bold shrink-0 shadow-md relative overflow-hidden"
                  style={{ background: iconStyle.bg }}
                >
                  <Image
                    src={iconStyle.icon}
                    alt={t.activityId}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain brightness-0 invert"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-medium text-sm">{t.activityId}</div>
                  <div className="text-text-secondary text-xs">{time}</div>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-text-primary shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
