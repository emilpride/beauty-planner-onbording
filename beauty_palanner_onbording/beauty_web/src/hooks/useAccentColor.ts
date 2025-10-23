import { useTheme } from '@/components/theme/ThemeProvider'

export function useAccentColor() {
  const { accent, setAccent } = useTheme()
  return { accent, setAccent }
}
