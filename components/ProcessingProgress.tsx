import { Loader2, Scan } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { OCRProgress } from '@/lib/ocr'

interface ProcessingProgressProps {
  progress: OCRProgress | null
  stage: 'ocr' | 'api' | null
}

export function ProcessingProgress({
  progress,
  stage,
}: ProcessingProgressProps) {
  if (!stage) return null

  const getStageInfo = () => {
    if (stage === 'ocr') {
      return {
        title: 'Extraindo texto (OCR)',
        description: progress?.status || 'Processando...',
        progress: Math.round((progress?.progress || 0) * 100),
        icon: Scan,
      }
    }
    return {
      title: 'Analisando patente',
      description: 'Enviando para API de análise...',
      progress: null,
      icon: Loader2,
    }
  }

  const info = getStageInfo()
  const Icon = info.icon

  return (
    <Card className="p-4 bg-primary/5 border-primary/20 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon
            className={`w-4 h-4 text-primary ${stage === 'api' ? 'animate-spin' : ''}`}
          />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">{info.title}</h4>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </div>
      </div>
      {info.progress !== null && (
        <div className="space-y-1">
          <Progress value={info.progress} className="h-2" />
          <p className="text-xs text-right text-muted-foreground">
            {info.progress}%
          </p>
        </div>
      )}
    </Card>
  )
}
