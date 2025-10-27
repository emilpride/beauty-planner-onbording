"use client"

export function BMSCard({
  score = 7.2,
  status = "Balanced",
  description = "Keep up with consistent routine!",
}: {
  score?: number
  status?: string
  description?: string
}) {
  // Calculate slider position (score 0-10 mapped to 0-100%)
  const position = ((score / 10) * 100).toFixed(0)
  
  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-border-subtle bg-surface p-6 shadow-md">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex w-full flex-row items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary">
            Your BMS<sup className="text-sm text-[rgb(var(--accent))]">®</sup> is:
          </h3>
          <span className="text-lg font-bold text-[rgb(var(--accent))]">{status}</span>
        </div>
        <p className="leading-relaxed text-base font-semibold text-text-primary">
          {description}
        </p>
      </div>

      {/* Score */}
      <div className="text-[64px] font-semibold leading-none text-[#84DE54]">
        {score.toFixed(1)}
      </div>

      {/* Gradient Slider */}
      <div className="relative w-full h-9">
        {/* Background track */}
  <div className="absolute top-[13px] h-2.5 w-full rounded-full bg-border-subtle" />
        
        {/* Gradient bar */}
        <div 
          className="absolute w-full h-[18px] top-[9px] rounded-full"
          style={{
            background: 'linear-gradient(270deg, #33C75A 0%, #84DE54 36.54%, #FFA64D 69.71%, #FF7D7E 100%)',
          }}
        />
        
        {/* Slider handle */}
        <div 
          className="absolute top-[2px] h-8 w-8 rounded-full border-2 border-border-subtle bg-gradient-to-b from-[#F2F2F2] to-[#E8E8E8] shadow-md transition-all"
          style={{ left: `calc(${position}% - 16px)` }}
        />
      </div>

      {/* Update Button */}
  <button className="flex w-full flex-row items-center justify-center rounded-[11px] bg-[rgb(var(--accent))] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        Update
      </button>
    </div>
  )
}
