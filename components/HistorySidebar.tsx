'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  type AnalysisHistory,
  formatAnalysisDate,
  getTextPreview,
  getAnalysisHistory,
  removeAnalysisFromHistory,
} from '@/lib/history'
import { FileText, Image, Trash2, History, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface HistorySidebarProps {
  onSelectAnalysis: (analysis: AnalysisHistory) => void
}

export function HistorySidebar({
  onSelectAnalysis,
}: HistorySidebarProps) {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {
    loadHistory()
    // Recarrega o histórico quando a janela recebe foco (para atualizar após salvar)
    const handleFocus = () => loadHistory()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadHistory = () => {
    const analyses = getAnalysisHistory()
    setHistory(analyses)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (!deleteId) return

    const success = removeAnalysisFromHistory(deleteId)
    if (success) {
      toast.success('Análise removida', {
        description: 'A análise foi removida do histórico.',
      })
      loadHistory()
    } else {
      toast.error('Erro ao remover', {
        description: 'Não foi possível remover a análise.',
      })
    }
    setDeleteId(null)
  }

  return (
    <>
      {/* Sidebar Colapsável */}
      <div 
        className={`hidden lg:flex bg-card/50 backdrop-blur-sm border-r border-border/30 flex-col shadow-soft shrink-0 h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-80'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <History className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">
                Histórico
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              title={isCollapsed ? 'Expandir histórico' : 'Retrair histórico'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        {isCollapsed ? (
          // Vista Colapsada - Apenas ícones
          <div className="flex-1 flex flex-col items-center py-4 gap-2 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-2">
                <History className="w-5 h-5 text-muted-foreground" />
              </div>
            ) : (
              history.slice(0, 10).map((analysis) => (
                <Button
                  key={analysis.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelectAnalysis(analysis)}
                  className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  title={getTextPreview(analysis.inputText, 50)}
                >
                  {analysis.inputType === 'image' ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </Button>
              ))
            )}
            {history.length > 10 && (
              <span className="text-xs text-muted-foreground">+{history.length - 10}</span>
            )}
          </div>
        ) : (
          // Vista Expandida - Conteúdo Completo
          <ScrollArea className="flex-1">
            {history.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhuma análise no histórico
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  As análises realizadas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {history.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className="p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelectAnalysis(analysis)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {analysis.inputType === 'image' ? (
                          <Image className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {formatAnalysisDate(analysis.timestamp)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(analysis.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground overflow-hidden text-ellipsis" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {getTextPreview(analysis.inputText, 80)}
                    </p>
                    {analysis.fileName && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {analysis.fileName}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
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

