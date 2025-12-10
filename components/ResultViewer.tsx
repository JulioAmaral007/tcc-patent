'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { exportToPDF } from '@/lib/pdf'
import { Check, Copy, Download, FileOutput, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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
      toast.success('Copiado!', {
        description: 'Resultado copiado para a área de transferência.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar o texto.',
      })
    }
  }

  const handleExportPDF = async () => {
    if (!result) return

    setIsExporting(true)
    try {
      await exportToPDF({
        result,
        title: 'Análise de Patente',
        filename: 'analise-patente',
      })
      toast.success('PDF exportado!', {
        description: 'O arquivo foi baixado com sucesso.',
      })
    } catch {
      toast.error('Erro ao exportar', {
        description: 'Não foi possível gerar o PDF.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-subtle" />
            <span className="text-sm font-medium text-foreground">
              Processando...
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center bg-card p-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <FileOutput className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum resultado
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Insira o texto da patente ou faça upload de um arquivo para ver o
          resultado da análise.
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex-1 flex flex-col bg-card overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Resultado da Análise
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exportando...' : 'PDF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
          {result}
        </pre>
      </ScrollArea>
    </Card>
  )
}
