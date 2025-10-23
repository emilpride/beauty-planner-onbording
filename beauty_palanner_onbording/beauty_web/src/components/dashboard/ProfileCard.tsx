export function ProfileCard() {
  return (
    <div className="rounded-lg bg-white shadow-sm overflow-hidden p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-[90px] w-[90px] rounded-full bg-gradient-to-br from-[#A385E9] to-[#E8B1EB] grid place-items-center text-white text-2xl font-bold ring-4 ring-white shadow-[0_0_0_4px_rgba(163,133,233,0.2)]">
            B
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[#333] font-semibold text-lg mb-2">Andrew Ainsley</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-[#F8F8F8] text-[#5C4688] font-semibold flex items-center gap-1">
              <span className="text-base">🏆</span> 9 level
            </span>
            <span className="px-2 py-1 rounded-full bg-[#E1FAED] text-[#2BAE70] font-semibold flex items-center gap-1">
              <span className="text-base">⭐</span> 3000 Activities
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
