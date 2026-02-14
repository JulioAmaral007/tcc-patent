'use client'

import { Toggle } from '@/components/ui/toggle'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <Toggle variant="outline" size="sm" aria-label="Toggle theme">
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
      aria-label="Toggle theme"
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Toggle>
  )
}
