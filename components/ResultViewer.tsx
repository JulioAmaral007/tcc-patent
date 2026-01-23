'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { exportToPDF } from '@/lib/pdf'
import { Check, Copy, Download, FileOutput, Sparkles, FileText, Image as ImageIcon, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ResultViewerProps {
  result: string | null
  isLoading: boolean
}

// Helper para renderizar o relatório formatado com UI Premium
function RenderReport({ text }: { text: string }) {
  // Tenta extrair partes do relatório (formato padrão gerado pelos formatters)
  const lines = text.split('\n')
  
  // Detecção básica de formato do relatório técnico
  const isFormattedReport = text.includes('════════════') && text.includes('📊 RESUMO DA BUSCA')
  
  if (!isFormattedReport) {
    return (
      <div className="font-mono text-sm leading-relaxed text-foreground/90 selection:bg-primary/20 bg-muted/20 p-4 rounded-xl border border-border/50">
        <pre className="whitespace-pre-wrap">{text}</pre>
      </div>
    )
  }

  // Extrator de seções
  const titleMatch = text.match(/═════+\n\s+(.*?)\n\s+═════+/s)
  const reportTitle = titleMatch ? titleMatch[1].trim() : 'RESULTADO DA ANÁLISE'
  
  // Dividir o texto em seções principais
  const sections = text.split(/📊 RESUMO DA BUSCA|📋 PATENTES SIMILARES|📋 TRECHOS SIMILARES|🖼️ IMAGENS SIMILARES/)
  const summaryPart = sections[1] || ''
  const resultsPart = sections[2] || ''

  // Parse do Resumo (Summary)
  const summaryLines = summaryPart
    .split('\n')
    .filter(l => l.includes('•'))
    .map(l => l.replace('•', '').replace('───', '').trim())

  // Parse dos Itens Resultantes
  // Divide por números de índice (ex: "1. ", "2. ")
  const items = resultsPart
    .split(/\n(?=\d+\.\s)/)
    .filter(i => i.trim().length > 0 && /^\d+\./.test(i.trim()))

  return (
    <div className="space-y-8 font-sans">
      {/* Seção de Título / Badge Centrado */}
      <div className="text-center animate-in fade-in duration-500">
        <div className="inline-block px-4 py-1.5 rounded-full bg-muted/50 border border-border text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
          {reportTitle}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Seção de Resumo da Busca */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resumo da Busca</span>
        </div>
        <div className="h-px bg-border/50 mb-4" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 px-2">
          {summaryLines.map((line, idx) => {
            const parts = line.split(':')
            const label = parts[0]
            const value = parts.slice(1).join(':')
            return (
              <li key={idx} className="flex items-baseline gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors mt-1.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">{label}:</span>
                <span className="text-sm text-foreground font-semibold">{value}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Seção de Resultados / Cards */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            {reportTitle.includes('IMAGEM') ? (
              <ImageIcon className="w-4 h-4 text-accent" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resultados Encontrados</span>
        </div>
        <div className="h-px bg-border/50 mb-6" />
        
        <div className="space-y-6">
          {items.map((item, idx) => {
            const itemLines = item.trim().split('\n')
            const title = itemLines[0]
            const details = itemLines.slice(1)

            return (
              <div key={idx} className="group relative">
                {/* Efeito de brilho ao passar o mouse */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative bg-muted/30 border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm">
                  <h4 className="text-base font-bold text-foreground mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-mono shadow-sm">
                      {idx + 1}
                    </span>
                    {title.replace(/^\d+\.\s*/, '')}
                  </h4>
                  
                  <div className="space-y-1.5 font-mono text-[13px] text-muted-foreground ml-2">
                    {details.map((detail, dIdx) => {
                      const parts = detail.split(':')
                      const label = parts[0]
                      const value = parts.slice(1).join(':')
                      
                      // Identifica campos para destaque
                      const isHighValue = detail.includes('Similaridade') || detail.includes('Publicação')
                      
                      return (
                        <div key={dIdx} className="flex gap-3 group/line hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                          <span className="text-border shrink-0 font-mono opacity-60">
                            {detail.includes('└──') || (dIdx === details.length - 1) ? '└──' : '├──'}
                          </span>
                          <div className="flex flex-wrap items-baseline gap-1.5 overflow-hidden">
                            <span className="whitespace-nowrap text-muted-foreground/80">{label.replace(/[├└]──\s*/, '').trim()}:</span>
                            <span className={cn(
                              "font-semibold truncate",
                              isHighValue ? "text-primary" : "text-foreground"
                            )}>
                              {value}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
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
      <div className="h-full flex flex-col glass-effect rounded-2xl overflow-hidden shadow-soft">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Processando análise...</span>
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
        <h3 className="text-lg font-bold text-foreground mb-2">Nenhum resultado</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Selecione uma patente no histórico ou realize uma nova busca para visualizar os detalhes.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col glass-effect rounded-2xl overflow-hidden shadow-soft">
      {/* Header com Botões de Ação */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/30 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Relatório da Análise</h3>
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
            <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'PDF'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 rounded-xl border-border hover:bg-muted gap-2 text-xs transition-all active:scale-95"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-primary" /> <span className="hidden sm:inline">Copiado</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Copiar</span></>
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
