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
import { SearchSettingsModal, defaultSearchParams, type SearchParams, type SearchType } from '@/components/SearchSettingsModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  analyzePatent, 
  formatSimilarityResults, 
  formatImageSimilarityResults,
  performTextSearch,
  performImageSearch 
} from '@/lib/api'
import type { SearchByTextResponse, ImagesSearchResponse } from '@/lib/types'
import {
  saveAnalysisToHistory,
  type AnalysisHistory,
} from '@/lib/history'
import { processFile, type OCRProgress } from '@/lib/ocr'
import { FileText, Sparkles, Trash2, Upload, Search, FileSearchIcon, ArrowRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ThemeToggle'


export default function Home() {
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)
  const [processingStage, setProcessingStage] = useState<'ocr' | 'api' | 'similarity' | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState('text')
  const [currentAnalysisInput, setCurrentAnalysisInput] = useState<string>('')
  
  // Handler para trocar de aba e ajustar searchType automaticamente
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab)
    // Ajusta o searchType baseado na aba selecionada
    setSearchParams(prev => ({
      ...prev,
      searchType: newTab === 'text' ? 'similarity' : 'image_search',
    }))
  }, [])
  
  // Search parameters state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ...defaultSearchParams,
    searchType: 'similarity', // Default for text
  })
  const [similarityResults, setSimilarityResults] = useState<SearchByTextResponse | ImagesSearchResponse | null>(null)

  // Determina se tem resultado (modo chat)
  const hasResult = result !== null

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

  const handleNewAnalysis = useCallback(() => {
    setResult(null)
    setCurrentAnalysisInput('')
    setSimilarityResults(null)
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
          description: 'Agora você pode tirar dúvidas sobre o resultado.',
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

  // Unified submit handler based on searchType
  const handleSubmit = useCallback(async () => {
    const isTextMode = activeTab === 'text'
    const currentSearchType = searchParams.searchType
    
    // Validation
    if (isTextMode && !textInput.trim()) {
      toast.error('Texto vazio', {
        description: 'Insira o texto para continuar.',
      })
      return
    }

    if (!isTextMode && !selectedFile) {
      toast.error('Nenhum arquivo selecionado', {
        description: 'Selecione uma imagem para continuar.',
      })
      return
    }

    setIsProcessing(true)
    setError(null)
    setSimilarityResults(null)


    try {
      // Determine which operation to run based on mode and searchType
      if (isTextMode) {
        if (currentSearchType === 'analyze') {
          // Analyze with AI
          setProcessingStage('api')
          const response = await analyzePatent(textInput)

          if (response.success) {
            setResult(response.result)
            setCurrentAnalysisInput(textInput)
            saveAnalysisToHistory(textInput, response.result, 'text')
            toast.success('Análise concluída!', {
              description: 'Agora você pode tirar dúvidas sobre o resultado.',
            })
          } else {
            throw new Error(response.error || 'Erro desconhecido.')
          }
        } else {
          // Similarity search (embed -> similarity)
          setProcessingStage('similarity')
          const response = await performTextSearch({
            text: textInput,
            similarity_threshold: searchParams.similarity_threshold,
            max_results: searchParams.max_results,
            use_chunks: searchParams.use_chunks,
          })
          
          setSimilarityResults(response)
          const formattedResult = formatSimilarityResults(response)
          setResult(formattedResult)
          setCurrentAnalysisInput(textInput)
          
          toast.success('Busca concluída!', {
            description: `Encontradas ${response.total_found} patentes similares.`,
          })
        }
      } else {
        // Image mode - always image search
        setProcessingStage('similarity')
        const response = await performImageSearch({
          file: selectedFile!,
          similarity_threshold: searchParams.similarity_threshold,
          max_results: searchParams.max_results,
        })
        
        setSimilarityResults(response)
        const formattedResult = formatImageSimilarityResults(response)
        setResult(formattedResult)
        
        toast.success('Busca concluída!', {
          description: `Encontradas ${response.total_found} imagens similares.`,
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar.'
      setError(errorMessage)
      toast.error('Erro', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
    }
  }, [textInput, selectedFile, searchParams, activeTab])

  const hasContent = textInput.trim().length > 0 || selectedFile !== null

  // ===== MODO CHAT (após ter resultado) =====
  if (hasResult && result) {
    return (
      <div className="h-screen flex flex-col overflow-hidden gradient-surface">
        <Header />

        <main className="flex-1 overflow-hidden flex animate-in fade-in duration-300">
          {/* History Sidebar - Retraído por padrão */}
          <HistorySidebar onSelectAnalysis={handleSelectAnalysis} />

          {/* Chat Panel - Área Principal */}
          <div className="flex-1 overflow-hidden container mx-auto px-4 py-6">
            <div className="h-full flex flex-col">
              {/* Botão para nova análise */}
              <div className="mb-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleNewAnalysis}
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Nova Análise
                </Button>
                <div className="text-sm text-muted-foreground">
                  Tire suas dúvidas sobre o resultado
                </div>
              </div>

              {/* Main Content Area: Chat + Result */}
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Chat Panel - Esquerda */}
                <div className="flex-[4] min-h-0">
                  <ChatPanel
                    analysisResult={result}
                    inputText={currentAnalysisInput}
                  />
                </div>
                
                {/* Result Panel - Direita */}
                <div className="flex-[6] min-h-0 flex flex-col">
                  <ResultViewer 
                    result={result} 
                    isLoading={false} 
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  // ===== MODO ENTRADA DE DADOS (estado inicial) =====
  return (
    <div className="h-screen flex flex-col overflow-hidden gradient-surface">
      {/* Header Minimalista */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm z-50 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <FileSearchIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Patent Analyzer
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* History Sidebar */}
        <HistorySidebar onSelectAnalysis={handleSelectAnalysis} />

        {/* Área de Entrada Centralizada */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center py-6 px-4 scrollbar-hide">
          <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
            
            {/* Card Principal de Entrada */}
            <Card className="p-6 bg-card/80 backdrop-blur-md shadow-soft border-border/30 rounded-3xl relative overflow-hidden">
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
                onValueChange={handleTabChange} 
                className="w-full space-y-6"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 h-11 bg-secondary/30 rounded-2xl">
                  <TabsTrigger value="text" className="gap-2 rounded-xl">
                    <FileText className="w-4 h-4" />
                    Texto
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2 rounded-xl">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-0">
                  <TextInputArea
                    value={textInput}
                    onChange={setTextInput}
                    disabled={isProcessing}
                    placeholder="Cole ou digite o texto da patente aqui..."
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

            {/* Botão de Submit Único */}
            <div className="flex items-stretch gap-3">
              <div className="flex-none">
                <SearchSettingsModal
                  params={searchParams}
                  onParamsChange={setSearchParams}
                  mode={activeTab === 'text' ? 'text' : 'image'}
                  disabled={isProcessing}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || (activeTab === 'text' ? !textInput.trim() : !selectedFile)}
                size="lg"
                className="flex-1 gap-3 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 hover:from-purple-600 hover:via-violet-600 hover:to-blue-600 text-white rounded-2xl h-14 text-base font-semibold shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : activeTab === 'text' ? (
                  <>
                    {searchParams.searchType === 'analyze' ? (
                      <><Sparkles className="w-5 h-5" /> Analisar com IA</>
                    ) : (
                      <><Search className="w-5 h-5" /> Buscar Similares</>
                    )}
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
                onDismiss={() => setError(null)}
                onRetry={handleSubmit}
              />
            )}

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
