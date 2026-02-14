import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatPanel } from '@/components/ChatPanel'
import { ResultViewer } from '@/components/ResultViewer'

import type { AnalysisResultData } from '@/lib/types'

interface AnalysisResultViewProps {
  /** Texto ou referência do que o usuário enviou (para contexto do chat) */
  inputText?: string
  /** Formatted text for PDF and clipboard */
  result: string
  /** Structured data for rendering (avoids regex parsing) */
  resultData?: AnalysisResultData | null
  onNewAnalysis: () => void
  conversationId?: string
}

export function AnalysisResultView({
  inputText,
  result,
  resultData,
  onNewAnalysis,
  conversationId,
}: AnalysisResultViewProps) {
  return (
    <div className="flex-1 overflow-hidden p-6 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Results view header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onNewAnalysis}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Ask questions about the result
          </p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-14rem)] min-h-[600px] lg:min-h-0">
          <div className="h-full flex flex-col min-h-0">
            <ResultViewer
              result={result}
              resultData={resultData}
              isLoading={false}
            />
          </div>
          <ChatPanel
            userInput={inputText}
            analysisResult={result}
            initialConversationId={conversationId}
          />
        </div>
      </div>
    </div>
  )
}
