import { Card } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'

interface ProcessingProgressProps {
  stage: 'api' | 'similarity' | null
}

export function ProcessingProgress({ stage }: ProcessingProgressProps) {
  if (!stage) return null

  const getStageInfo = () => {
    if (stage === 'similarity') {
      return {
        title: 'Searching similar patents',
        description: 'Comparing embeddings...',
        icon: Search,
      }
    }
    return {
      title: 'Analyzing patent',
      description: 'Sending to analysis API...',
      icon: Loader2,
    }
  }

  const info = getStageInfo()
  const Icon = info.icon

  return (
    <Card className="p-4 bg-primary/5 border-primary/20 animate-fade-in">
      <div className="flex items-center gap-3">
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
    </Card>
  )
}
