'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailItemProps {
  label: string
  value: string
  isHighValue: boolean
  isLast: boolean
}

export function DetailItem({
  label,
  value,
  isHighValue,
  isLast,
}: DetailItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cleanLabel = label.replace(/[├└]──\s*/, '').trim()

  // Detect if summary or abstract (supports PT/EN labels)
  const isSummary =
    cleanLabel.toLowerCase().includes('resumo') ||
    cleanLabel.toLowerCase().includes('summary') ||
    cleanLabel.toLowerCase().includes('abstract') ||
    cleanLabel.toLowerCase().includes('description')

  // Allow expand for long summary; strip trailing '...' from backend when expanded
  const displayValue =
    isSummary && isExpanded ? value.replace(/\.\.\.$/, '') : value
  const canExpand = isSummary && (value.length > 80 || value.includes('...'))

  return (
    <div className="flex gap-3 group/line hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
      <span className="text-border shrink-0 font-mono opacity-60">
        {isLast ? '└──' : '├──'}
      </span>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-1.5 overflow-hidden">
          <span className="whitespace-nowrap text-muted-foreground/80">
            {cleanLabel}:
          </span>
          <span
            className={cn(
              'font-semibold transition-all duration-300',
              isHighValue ? 'text-primary' : 'text-foreground text-sm',
              isSummary && !isExpanded
                ? 'line-clamp-2'
                : !isSummary
                  ? 'truncate'
                  : 'whitespace-pre-wrap',
            )}
          >
            {displayValue}
          </span>
        </div>
        {canExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-primary hover:text-primary-foreground hover:bg-primary px-2 py-0.5 rounded-lg border border-primary/20 font-bold uppercase tracking-wider w-fit flex items-center gap-1 transition-all active:scale-95 mt-1 bg-primary/5"
          >
            {isExpanded ? (
              <>
                See less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                See more <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
