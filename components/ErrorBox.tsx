import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorBoxProps {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
}

export function ErrorBox({ message, onDismiss, onRetry }: ErrorBoxProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-destructive mb-1">Erro</h4>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onRetry && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRetry}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
