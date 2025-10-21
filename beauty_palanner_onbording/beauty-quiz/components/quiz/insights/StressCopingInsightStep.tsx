"use client"

import OnboardingStep from "@/components/quiz/OnboardingStep"
import { useQuizStore } from "@/store/quizStore"

export default function StressCopingInsightStep() {
  const { answers } = useQuizStore()
  const level = answers.Stress || "" // '', 'rarely' | 'sometimes' | 'often' | 'always'

  // Subtle personalization via colors
  const palette: Record<string, { from: string; to: string; ring: string }> = {
    "": { from: "#A1C4FD", to: "#C2E9FB", ring: "rgba(85, 130, 255, 0.35)" },
    rarely: { from: "#9BE7C4", to: "#B3F3D9", ring: "rgba(51, 197, 140, 0.35)" },
    sometimes: { from: "#FFE29A", to: "#FFA99A", ring: "rgba(255, 170, 80, 0.35)" },
    often: { from: "#FBC2EB", to: "#A6C1EE", ring: "rgba(171, 120, 255, 0.35)" },
    always: { from: "#FFD1D1", to: "#FFE5C3", ring: "rgba(255, 120, 120, 0.35)" },
  }
  const selected = (palette[level] ?? palette[""]) as { from: string; to: string; ring: string }
  const { from, to, ring } = selected

  return (
    <OnboardingStep title="Take a breath" subtitle="10-second reset" buttonText="Continue" centerContent>
      {/* Compact annotation about the user's answer */}
      <div className="w-full flex justify-center mb-2">
        <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
          <span className="opacity-80">Based on your answer:</span>
          <span
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{
              background: `${to}22`,
              color: "#374151",
              border: `1px solid ${to}55`,
            }}
          >
            {level ? level.charAt(0).toUpperCase() + level.slice(1) : "Not set"}
          </span>
        </span>
      </div>
      <div className="w-full flex items-center justify-center py-2">
        <div className="relative w-full max-w-[320px] aspect-square select-none" aria-hidden="true">
          {/* Soft glow background */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background: `radial-gradient(60% 60% at 50% 50%, ${from} 0%, ${to} 100%)`,
              animation: "var(--glow)",
            }}
          />

          {/* Breathing orb */}
          <div
            className="absolute inset-6 rounded-full shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${from}, ${to})`,
              animation: "var(--breath)",
            }}
          />

          {/* Concentric rings */}
          <div className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${ring}`,
                  transform: "scale(0.75)",
                  animation: `ring 6s ease-in-out ${i * 1.2}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Floating dots */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/70"
                style={{
                  left: `${10 + (i * 11.5) % 80}%`,
                  top: `${10 + (i * 17.5) % 80}%`,
                  animation: `float ${5 + (i % 4)}s ease-in-out ${(i % 3) * 0.8}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Minimal hint for timing */}
  <p className="mt-2 text-center text-sm text-text-secondary">Inhale 4 • Hold 4 • Exhale 4</p>

      {/* Accessible description */}
      <p className="sr-only">Calming breathing animation. You can continue when ready.</p>

      <style jsx>{`
        :root { --dur: 6s; }
        @keyframes breath {
          0% { transform: scale(0.94); }
          25% { transform: scale(1.06); }
          50% { transform: scale(1.02); }
          75% { transform: scale(1.06); }
          100% { transform: scale(0.94); }
        }
        @keyframes glow {
          0%,100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
        @keyframes ring {
          0% { transform: scale(0.78); opacity: 0.0; }
          25% { opacity: 1; }
          50% { transform: scale(0.98); opacity: 0.5; }
          100% { transform: scale(0.78); opacity: 0.0; }
        }
        @keyframes float {
          from { transform: translateY(-6px); }
          to { transform: translateY(6px); }
        }
        /* Assign variables so we can disable with reduced motion */
        :global(.dark) .breath-orb { box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        :root { --breath: breath var(--dur) ease-in-out infinite; --glow: glow calc(var(--dur) * 0.9) ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </OnboardingStep>
  )
}
