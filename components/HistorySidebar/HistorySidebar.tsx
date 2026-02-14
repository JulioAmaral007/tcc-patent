'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  type AnalysisHistory,
  getFullHistory,
  removeAnalysisFromHistory,
} from '@/lib/history'
import { History, Search, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { HistoryItem } from './HistoryItem'

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

  const loadHistory = useCallback(() => {
    getFullHistory().then((analyses) => setHistory(analyses))
  }, [])

  useEffect(() => {
    let cancelled = false
    getFullHistory().then((analyses) => {
      if (!cancelled) setHistory(analyses)
    })
    const handleFocus = () => loadHistory()
    window.addEventListener('focus', handleFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadHistory])

  const filteredHistory = history.filter(
    (item) =>
      item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fileName &&
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const confirmDelete = async () => {
    if (!deleteId) return
    const success = await removeAnalysisFromHistory(deleteId)
    if (success) {
      toast.success('Analysis removed')
      loadHistory()
    } else {
      toast.error('Error removing')
    }
    setDeleteId(null)
  }

  return (
    <>
      <div className="flex bg-card/95 backdrop-blur-xl border-r border-border flex-col shadow-2xl w-full h-full pointer-events-auto">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <History className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                History
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

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 scrollbar-custom" type="auto">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                <History className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No records found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchTerm
                    ? 'Try other search terms'
                    : 'Your analyses will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredHistory.map((analysis) => (
                <HistoryItem
                  key={analysis.id}
                  analysis={analysis}
                  onSelect={onSelectAnalysis}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete analysis"
        description="Are you sure you want to delete this analysis from history? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
