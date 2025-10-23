export function ActivityStats({
  completionRate,
  activitiesCompleted,
  perfectDays,
}: {
  completionRate: number // 0..1
  activitiesCompleted: number
  perfectDays: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Completion rate" value={`${Math.round((completionRate || 0) * 100)}%`} />
      <Stat label="Activities completed" value={String(activitiesCompleted)} />
      <Stat label="Current streak (perfect days)" value={String(perfectDays)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-zinc-50 to-white ring-1 ring-black/5 p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}
