'use client'

import { Button } from '@/components/ui/button'
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react'
import { 
  type AnalysisHistory, 
  formatAnalysisDate, 
  getTextPreview 
} from '@/lib/history'

interface HistoryItemProps {
  analysis: AnalysisHistory
  onSelect: (analysis: AnalysisHistory) => void
  onDelete: (id: string) => void
}

export function HistoryItem({ analysis, onSelect, onDelete }: HistoryItemProps) {
  return (
    <div className="group relative">
      <div 
        onClick={() => onSelect(analysis)}
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
              onDelete(analysis.id)
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
  )
}
