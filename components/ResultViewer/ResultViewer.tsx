'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { exportToPDF } from '@/lib/pdf'
import { Check, Copy, Download, FileOutput, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RenderReport } from './RenderReport'

interface ResultViewerProps {
  result: string | null
  isLoading: boolean
}

export function ResultViewer({ result, isLoading }: ResultViewerProps) {
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleCopy = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('Copied!', {
        description: 'Result copied to clipboard.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error copying', {
        description: 'Could not copy the text.',
      })
    }
  }

  const handleExportPDF = async () => {
    if (!result) return

    setIsExporting(true)
    try {
      await exportToPDF({
        result,
        title: 'Patent Analysis',
        filename: 'patent-analysis',
      })
      toast.success('PDF exported!', {
        description: 'The file was downloaded successfully.',
      })
    } catch {
      toast.error('Error exporting', {
        description: 'Could not generate the PDF.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col glass-effect rounded-2xl overflow-hidden shadow-soft">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Processing analysis...</span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-effect rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 shadow-glow">
          <FileOutput className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No result</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Select a patent in history or perform a new search to view details.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col glass-effect rounded-2xl overflow-hidden shadow-soft">
      {/* Header with Action Buttons */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/30 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Analysis Report</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="h-8 rounded-xl border-border hover:bg-muted gap-2 text-xs transition-all active:scale-95"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'PDF'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 rounded-xl border-border hover:bg-muted gap-2 text-xs transition-all active:scale-95"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-primary" /> <span className="hidden sm:inline">Copied</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Copy</span></>
            )}
          </Button>
        </div>
      </div>

      {/* Conteúdo Renderizado do Relatório */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom bg-background/5 relative">
        <RenderReport text={result} />
      </div>
    </div>
  )
}
