'use client'

import { Search, Image as ImageIcon, FileText } from 'lucide-react'
import { DetailItem } from './DetailItem'

interface RenderReportProps {
  text: string
}

export function RenderReport({ text }: RenderReportProps) {
  // Tenta extrair partes do relatório (formato padrão gerado pelos formatters)
  const lines = text.split('\n')
  
  // Detecção básica de formato do relatório técnico
  const isFormattedReport = text.includes('════════════') && (text.includes('📊 RESUMO DA BUSCA') || text.includes('📊 SEARCH SUMMARY'))
  
  if (!isFormattedReport) {
    return (
      <div className="font-mono text-sm leading-relaxed text-foreground/90 selection:bg-primary/20 bg-muted/20 p-4 rounded-xl border border-border/50">
        <pre className="whitespace-pre-wrap">{text}</pre>
      </div>
    )
  }

  // Extrator de seções
  const titleMatch = text.match(/═════+\n\s+(.*?)\n\s+═════+/s)
  const reportTitle = titleMatch ? titleMatch[1].trim() : 'ANALYSIS RESULT'
  
  // Dividir o texto em seções principais
  const sections = text.split(/📊 RESUMO DA BUSCA|📊 SEARCH SUMMARY|📋 PATENTES SIMILARES|📋 SIMILAR PATENTS|📋 TRECHOS SIMILARES|📋 SIMILAR EXCERPTS|🖼️ IMAGENS SIMILARES|🖼️ SIMILAR IMAGES/)
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
    .split(/\n\s*(?=\d+\.\s)/)
    .filter(i => i.trim().length > 0 && /^\d+\./.test(i.trim()))

  return (
    <div className="space-y-8 font-sans">
      {/* Seção de Resumo da Busca */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Search Summary</span>
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
            {reportTitle.includes('IMAGE') || reportTitle.includes('IMAGEM') ? (
              <ImageIcon className="w-4 h-4 text-accent" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Results Found</span>
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
                      const isHighValue = detail.includes('Similaridade') || detail.includes('Publicação')
                      const isLast = (dIdx === details.length - 1)

                      return (
                        <DetailItem 
                          key={dIdx}
                          label={label}
                          value={value}
                          isHighValue={isHighValue}
                          isLast={isLast}
                        />
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
