'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  type AnalysisHistory,
  formatAnalysisDate,
  getTextPreview,
  getFullHistory,
  removeAnalysisFromHistory,
} from '@/lib/history'
import { FileText, Image as ImageIcon, Trash2, History, Search, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface HistorySidebarProps {
  onSelectAnalysis: (analysis: AnalysisHistory) => void
  onClose?: () => void
}

export function HistorySidebar({
  onSelectAnalysis,
  onClose,
}: HistorySidebarProps) {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadHistory = useCallback(async () => {
    const analyses = await getFullHistory()
    setHistory(analyses)
  }, [])

  useEffect(() => {
    loadHistory()
    const handleFocus = () => loadHistory()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadHistory])

  const filteredHistory = history.filter(item => 
    item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    const success = await removeAnalysisFromHistory(deleteId)
    if (success) {
      toast.success('Análise removida')
      loadHistory()
    } else {
      toast.error('Erro ao remover')
    }
    setDeleteId(null)
  }

  return (
    <>
      <div className="flex bg-card/95 backdrop-blur-xl border-r border-border flex-col shadow-2xl w-80 h-full pointer-events-auto">
        {/* Header */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <History className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Histórico
              </h2>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Pesquisar análises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 scrollbar-custom">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                <History className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Nenhum registro encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchTerm ? 'Tente outros termos de busca' : 'Suas análises aparecerão aqui'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  className="group relative"
                >
                  <div 
                    onClick={() => onSelectAnalysis(analysis)}
                    className="p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-background/50 flex items-center justify-center border border-border/50">
                          {analysis.inputType === 'image' ? (
                            <ImageIcon className="w-3 h-3 text-primary" />
                          ) : (
                            <FileText className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {formatAnalysisDate(analysis.timestamp)}
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(analysis.id)
                        }}
                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed font-medium">
                      {getTextPreview(analysis.inputText, 100)}
                    </p>

                    {analysis.fileName && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary/70 font-mono">
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                        <span className="truncate">{analysis.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir análise"
        description="Tem certeza que deseja excluir esta análise do histórico? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}

