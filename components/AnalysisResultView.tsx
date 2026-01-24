import { ArrowLeft } from 'lucide-react'
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
    <div className="flex-1 overflow-hidden p-6 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header da visualização de resultados */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onNewAnalysis}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nova Análise
          </Button>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tire suas dúvidas sobre o resultado
          </p>
        </div>
        
        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-14rem)] min-h-[600px] lg:min-h-0">
          <div className="h-full flex flex-col min-h-0">
            <ResultViewer 
              result={result} 
              isLoading={false} 
            />
          </div>
          <ChatPanel analysisResult={result} />
        </div>
      </div>
    </div>
  )
}
