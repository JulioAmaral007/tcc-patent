import { FileText } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

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
          Texto da Patente
        </label>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Cole ou digite o texto da patente aqui...'}
        className="flex-1 min-h-[200px] resize-none font-mono text-sm bg-card border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      <p className="text-xs text-muted-foreground">
        {value.length.toLocaleString()} caracteres
      </p>
    </div>
  )
}
