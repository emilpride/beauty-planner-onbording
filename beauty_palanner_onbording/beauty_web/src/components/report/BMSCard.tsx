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
    <div className="flex flex-col items-center p-6 gap-6 bg-white dark:bg-surface rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex flex-row justify-between items-center w-full">
          <h3 className="text-xl font-bold text-[#5C4688] dark:text-text-primary">
            Your BMS<sup className="text-sm">®</sup> is:
          </h3>
          <span className="text-lg font-bold text-[#A385E9]">{status}</span>
        </div>
        <p className="text-base font-semibold text-[#333333] dark:text-text-secondary leading-relaxed">
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
        <div className="absolute w-full h-2.5 top-[13px] bg-[#EBEDFC] dark:bg-surface-hover rounded-full" />
        
        {/* Gradient bar */}
        <div 
          className="absolute w-full h-[18px] top-[9px] rounded-full"
          style={{
            background: 'linear-gradient(270deg, #33C75A 0%, #84DE54 36.54%, #FFA64D 69.71%, #FF7D7E 100%)',
          }}
        />
        
        {/* Slider handle */}
        <div 
          className="absolute w-8 h-8 top-[2px] rounded-full bg-gradient-to-b from-[#F2F2F2] to-[#E8E8E8] border-2 border-white shadow-md transition-all"
          style={{ left: `calc(${position}% - 16px)` }}
        />
      </div>

      {/* Update Button */}
      <button className="flex flex-row justify-center items-center py-3.5 w-full bg-[#A385E9] hover:bg-[#8D6FD1] rounded-[11px] text-white font-semibold text-sm transition-colors">
        Update
      </button>
    </div>
  )
}
