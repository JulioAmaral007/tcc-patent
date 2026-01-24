import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'

interface TextInputAreaProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TextInputArea({
  value,
  onChange,
  disabled,
  placeholder,
}: TextInputAreaProps) {
  return (
    <div className="space-y-3 flex-1 flex flex-col">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium text-foreground">
          Patent Text
        </label>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Paste or type the patent text here...'}
        className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto resize-none font-mono text-sm bg-background/50 border-border/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60 scrollbar-custom text-white"
      />
      <p className="text-xs text-muted-foreground">
        {value.length.toLocaleString()} characters
      </p>
    </div>
  )
}
