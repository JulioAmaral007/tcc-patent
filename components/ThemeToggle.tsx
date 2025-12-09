'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Toggle variant="outline" size="sm" aria-label="Alternar tema">
        <Sun className="size-4" />
      </Toggle>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={isDark}
      onPressedChange={(pressed) => {
        setTheme(pressed ? 'dark' : 'light')
      }}
      aria-label="Alternar tema"
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Toggle>
  )
}
