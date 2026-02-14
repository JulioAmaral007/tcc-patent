'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import type { SliderConfig } from '@/lib/types'

interface ParameterSliderProps {
  config: SliderConfig
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function ParameterSlider({
  config,
  value,
  onChange,
  disabled = false,
}: ParameterSliderProps) {
  const formatValue = (val: number) => {
    // Format based on step - show decimal places only if needed
    if (config.step < 1) {
      return val.toFixed(2)
    }
    return val.toString()
  }

  return (
    <div className="space-y-3">
      {/* Label with value and tooltip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={config.id}
            className="text-sm font-medium text-foreground"
          >
            {config.label}
          </Label>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="max-w-xs text-sm bg-popover text-popover-foreground border shadow-lg"
              >
                <p>{config.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-semibold text-primary tabular-nums bg-primary/10 px-2 py-0.5 rounded">
          {formatValue(value)}
        </span>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <Slider
          id={config.id}
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={config.min}
          max={config.max}
          step={config.step}
          disabled={disabled}
          className="w-full"
        />

        {/* Min/Max labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {formatValue(config.min)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatValue(config.max)}
          </span>
        </div>
      </div>

      {/* Description for mobile/always visible */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {config.description}
      </p>
    </div>
  )
}
