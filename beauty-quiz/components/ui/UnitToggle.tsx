'use client'

interface UnitToggleProps {
  options: { value: string; label: string }[]
  selectedValue: string
  onChange: (value: string) => void
}

export default function UnitToggle({ options, selectedValue, onChange }: UnitToggleProps) {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue)

  return (
    <div className="relative flex w-full max-w-[120px] items-center rounded-full bg-gray-100 p-1">
      <div
        className="absolute top-1 bottom-1 h-auto w-1/2 rounded-full bg-primary shadow-md transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${selectedIndex * 100}%)` }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 w-1/2 rounded-full py-1.5 text-center text-sm font-semibold transition-colors duration-300
            ${selectedValue === option.value ? 'text-white' : 'text-gray-500'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
