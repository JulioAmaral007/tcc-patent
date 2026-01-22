'use client'

import { FileText, Sparkles, Trash2, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TextInputArea } from '@/components/TextInputArea'
import { UploadArea } from '@/components/UploadArea'
import { ImagePreview } from '@/components/ImagePreview'
import { SearchSettingsModal, type SearchParams } from '@/components/SearchSettingsModal'
import { ProcessingProgress } from '@/components/ProcessingProgress'
import { ErrorBox } from '@/components/ErrorBox'
import type { OCRProgress } from '@/lib/ocr'

interface AnalysisInputViewProps {
  activeTab: string
  onTabChange: (tab: string) => void
  textInput: string
  onTextInputChange: (val: string) => void
  isProcessing: boolean
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onClearFile: () => void
  onProcessOCR: () => void
  extractedText: string
  hasContent: boolean
  onClearAll: () => void
  searchParams: SearchParams
  onSearchParamsChange: (params: SearchParams) => void
  onSubmit: () => void
  ocrProgress: OCRProgress | null
  processingStage: 'ocr' | 'api' | 'similarity' | null
  error: string | null
  onDismissError: () => void
}

export function AnalysisInputView({
  activeTab,
  onTabChange,
  textInput,
  onTextInputChange,
  isProcessing,
  selectedFile,
  onFileSelect,
  onClearFile,
  onProcessOCR,
  extractedText,
  hasContent,
  onClearAll,
  searchParams,
  onSearchParamsChange,
  onSubmit,
  ocrProgress,
  processingStage,
  error,
  onDismissError,
}: AnalysisInputViewProps) {
  return (
    <div className="flex-1 overflow-y-auto flex items-start justify-center py-6 px-4 scrollbar-hide">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Card Principal de Entrada */}
        <Card className="p-6 bg-card/80 backdrop-blur-md shadow-soft border-border/30 rounded-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Entrada de Dados
            </h2>
            {hasContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={onTabChange} 
            className="w-full space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 p-1 h-11 bg-secondary/30 rounded-lg">
              <TabsTrigger value="text" className="gap-2 rounded-md">
                <FileText className="w-4 h-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2 rounded-md">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0">
              <TextInputArea
                value={textInput}
                onChange={onTextInputChange}
                disabled={isProcessing}
                placeholder="Cole ou digite o texto da patente aqui..."
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-0 space-y-4">
              <UploadArea
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
                onClearFile={onClearFile}
                isProcessing={isProcessing}
              />

              <ImagePreview file={selectedFile} />

              {selectedFile && !extractedText && (
                <Button
                  onClick={onProcessOCR}
                  disabled={isProcessing}
                  className="w-full gap-2 gradient-primary"
                >
                  <Sparkles className="w-4 h-4" />
                  Extrair Texto (OCR)
                </Button>
              )}

              {extractedText && (
                <Card className="p-4 bg-success/5 border-success/20">
                  <p className="text-sm text-success font-medium mb-1">
                    ✓ Texto extraído com sucesso
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {extractedText.length.toLocaleString()} caracteres
                    adicionados ao campo de texto.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Botão de Submit Único */}
        <div className="flex items-stretch gap-3">
          <div className="flex-none">
            <SearchSettingsModal
              params={searchParams}
              onParamsChange={onSearchParamsChange}
              mode={activeTab === 'text' ? 'text' : 'image'}
              disabled={isProcessing}
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={isProcessing || (activeTab === 'text' ? !textInput.trim() : !selectedFile)}
            size="lg"
            className="flex-1 gap-3 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 text-white rounded-lg h-14 text-base font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : activeTab === 'text' ? (
              <>
                <Search className="w-5 h-5" /> Buscar Similares
              </>
            ) : (
              <><Search className="w-5 h-5" /> Buscar por Imagem</>
            )}
          </Button>
        </div>

        {/* Progress & Error */}
        <ProcessingProgress
          progress={ocrProgress}
          stage={processingStage}
        />

        {error && (
          <ErrorBox
            message={error}
            onDismiss={onDismissError}
            onRetry={onSubmit}
          />
        )}

      </div>
    </div>
  )
}
