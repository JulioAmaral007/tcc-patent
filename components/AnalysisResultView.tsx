'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatPanel } from '@/components/ChatPanel'
import { ResultViewer } from '@/components/ResultViewer'

interface AnalysisResultViewProps {
  result: string
  onNewAnalysis: () => void
}

export function AnalysisResultView({
  result,
  onNewAnalysis,
}: AnalysisResultViewProps) {
  return (
    <div className="flex-1 overflow-hidden container mx-auto px-4 py-6">
      <div className="h-full flex flex-col">
        {/* Botão para nova análise */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onNewAnalysis}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Nova Análise
          </Button>
          <div className="text-sm text-muted-foreground">
            Tire suas dúvidas sobre o resultado
          </div>
        </div>

        {/* Main Content Area: Chat + Result */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Chat Panel - Esquerda */}
          <div className="flex-[4] min-h-0">
            <ChatPanel
              analysisResult={result}
            />
          </div>
          
          {/* Result Panel - Direita */}
          <div className="flex-[6] min-h-0 flex flex-col">
            <ResultViewer 
              result={result} 
              isLoading={false} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
