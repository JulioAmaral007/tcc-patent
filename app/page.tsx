'use client'

import { ChatPanel } from '@/components/ChatPanel'
import { ErrorBox } from '@/components/ErrorBox'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { ImagePreview } from '@/components/ImagePreview'
import { ProcessingProgress } from '@/components/ProcessingProgress'
import { ResultViewer } from '@/components/ResultViewer'
import { TextInputArea } from '@/components/TextInputArea'
import { UploadArea } from '@/components/UploadArea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyzePatent } from '@/lib/api'
import {
  saveAnalysisToHistory,
  type AnalysisHistory,
} from '@/lib/history'
import { processFile, type OCRProgress } from '@/lib/ocr'
import { FileText, Sparkles, Trash2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export default function Home() {
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)
  const [processingStage, setProcessingStage] = useState<'ocr' | 'api' | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState('text')
  const [currentAnalysisInput, setCurrentAnalysisInput] = useState<string>('')

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setExtractedText('')
    setError(null)
  }, [])

  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    setExtractedText('')
    setError(null)
  }, [])

  const handleClearAll = useCallback(() => {
    setTextInput('')
    setSelectedFile(null)
    setExtractedText('')
    setResult(null)
    setCurrentAnalysisInput('')
    setError(null)
    setOcrProgress(null)
    setProcessingStage(null)
  }, [])

  const handleSelectAnalysis = useCallback((analysis: AnalysisHistory) => {
    setTextInput(analysis.inputText)
    setResult(analysis.result)
    setCurrentAnalysisInput(analysis.inputText)
    setSelectedFile(null)
    setExtractedText('')
    toast.success('Análise carregada', {
      description: 'A análise foi restaurada do histórico.',
    })
  }, [])

  const handleProcessOCR = useCallback(async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setProcessingStage('ocr')
    setOcrProgress({ status: 'Iniciando...', progress: 0 })

    try {
      const text = await processFile(selectedFile, (progress) => {
        setOcrProgress(progress)
      })

      setExtractedText(text)
      setTextInput((prev) => prev + (prev ? '\n\n' : '') + text)

      toast.success('Texto extraído!', {
        description: `${text.length.toLocaleString()} caracteres extraídos do arquivo.`,
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar arquivo.'
      setError(errorMessage)
      toast.error('Erro no OCR', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
      setOcrProgress(null)
    }
  }, [selectedFile])

  const handleAnalyze = useCallback(async () => {
    if (!textInput.trim()) {
      toast.error('Texto vazio', {
        description: 'Insira o texto da patente para análise.',
      })
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessingStage('api')

    try {
      const response = await analyzePatent(textInput)

      if (response.success) {
        setResult(response.result)
        setCurrentAnalysisInput(textInput)
        
        // Salva no histórico
        saveAnalysisToHistory(
          textInput,
          response.result,
          selectedFile ? 'image' : 'text',
          selectedFile?.name,
        )
        
        toast.success('Análise concluída!', {
          description: 'O resultado está disponível no painel direito.',
        })
      } else {
        throw new Error(response.error || 'Erro desconhecido.')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao analisar patente.'
      setError(errorMessage)
      toast.error('Erro na análise', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
    }
  }, [textInput, selectedFile])

  const getFinalText = () => textInput
  const hasContent = textInput.trim().length > 0 || selectedFile !== null

  const hasResult = result !== null
  const showChat = hasResult

  return (
    <div className="h-screen flex flex-col overflow-hidden gradient-surface">
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex gap-6">
        {/* History Sidebar - Always Visible */}
        <HistorySidebar onSelectAnalysis={handleSelectAnalysis} />

        <div className="flex-1 overflow-hidden container mx-auto px-4 py-6">
          <div className="flex gap-6 h-full">

            {/* Left Panel - Input or Chat */}
            <div className="flex flex-col gap-4 overflow-hidden flex-1 lg:flex-[0_0_50%]">
            {showChat && result ? (
              <ChatPanel
                analysisResult={result}
                inputText={currentAnalysisInput}
              />
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto">
            <Card className="p-6 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Entrada de Dados
                </h2>
                {hasContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="text" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Texto
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-0">
                  <TextInputArea
                    value={textInput}
                    onChange={setTextInput}
                    disabled={isProcessing}
                    placeholder="Cole ou digite o texto da patente aqui. Você também pode extrair texto de imagens ou PDFs na aba Upload."
                  />
                </TabsContent>

                <TabsContent value="upload" className="mt-0 space-y-4">
                  <UploadArea
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onClearFile={handleClearFile}
                    isProcessing={isProcessing}
                  />

                  <ImagePreview file={selectedFile} />

                  {selectedFile && !extractedText && (
                    <Button
                      onClick={handleProcessOCR}
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

            {/* Progress & Error */}
            <ProcessingProgress
              progress={ocrProgress}
              stage={processingStage}
            />

            {error && (
              <ErrorBox
                message={error}
                onDismiss={() => setError(null)}
                onRetry={
                  processingStage === 'ocr' ? handleProcessOCR : handleAnalyze
                }
              />
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isProcessing || !textInput.trim()}
              size="lg"
              className="w-full gap-2 gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-5 h-5" />
              Analisar Patente
            </Button>

            {/* Stats */}
            {textInput.trim() && (
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center bg-card">
                  <p className="text-2xl font-bold text-primary">
                    {textInput
                      .split(/\s+/)
                      .filter(Boolean)
                      .length.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Palavras</p>
                </Card>
                <Card className="p-3 text-center bg-card">
                  <p className="text-2xl font-bold text-primary">
                    {textInput.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Caracteres</p>
                </Card>
                <Card className="p-3 text-center bg-card">
                  <p className="text-2xl font-bold text-primary">
                    {textInput.split(/\n\n+/).filter(Boolean).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Parágrafos</p>
                </Card>
              </div>
            )}
              </div>
            )}
          </div>

            {/* Right Panel - Results */}
            <div className="flex flex-col overflow-hidden flex-1 lg:flex-[0_0_50%]">
              <ResultViewer
                result={result}
                isLoading={processingStage === 'api'}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
