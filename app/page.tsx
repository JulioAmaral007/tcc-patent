'use client'

import { AnalysisInputView } from '@/components/AnalysisInputView'
import { AnalysisResultView } from '@/components/AnalysisResultView'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { defaultSearchParams, type SearchParams } from '@/components/SearchSettingsModal'
import { 
  analyzePatent, 
  formatSimilarityResults, 
  formatImageSimilarityResults,
  performTextSearch,
  performImageSearch 
} from '@/lib/api'

import {
  saveAnalysisToHistory,
  type AnalysisHistory,
} from '@/lib/history'
import { processFile, type OCRProgress } from '@/lib/ocr'
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
  const [processingStage, setProcessingStage] = useState<'ocr' | 'api' | 'similarity' | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState('text')

  
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

    setError(null)
    setOcrProgress(null)
    setProcessingStage(null)
  }, [])

  const handleNewAnalysis = useCallback(() => {
    setResult(null)


  }, [])

  const handleSelectAnalysis = useCallback((analysis: AnalysisHistory) => {
    setTextInput(analysis.inputText)
    setResult(analysis.result)
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



    try {
      // Determine which operation to run based on mode and searchType
      if (isTextMode) {
        if (currentSearchType === 'analyze') {
          // Analyze with AI
          setProcessingStage('api')
          const response = await analyzePatent(textInput)

          if (response.success) {
            setResult(response.result)
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
          

          const formattedResult = formatSimilarityResults(response)
          setResult(formattedResult)
          
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

  return (
    <div className="h-screen flex flex-col overflow-hidden gradient-surface">
      <Header />

      <main className="flex-1 overflow-hidden flex">
        <HistorySidebar onSelectAnalysis={handleSelectAnalysis} />

        {hasResult && result ? (
          <AnalysisResultView
            result={result}
            onNewAnalysis={handleNewAnalysis}
          />
        ) : (
          <AnalysisInputView
            activeTab={activeTab}
            onTabChange={handleTabChange}
            textInput={textInput}
            onTextInputChange={setTextInput}
            isProcessing={isProcessing}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
            onProcessOCR={handleProcessOCR}
            extractedText={extractedText}
            hasContent={hasContent}
            onClearAll={handleClearAll}
            searchParams={searchParams}
            onSearchParamsChange={setSearchParams}
            onSubmit={handleSubmit}
            ocrProgress={ocrProgress}
            processingStage={processingStage}
            error={error}
            onDismissError={() => setError(null)}
          />
        )}
      </main>
      
      <Footer />
    </div>
  )
}
