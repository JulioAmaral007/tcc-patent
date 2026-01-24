'use client'

import { useCallback, useState, useMemo, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import { AnalysisInputView } from '@/components/AnalysisInputView'
import { AnalysisResultView } from '@/components/AnalysisResultView'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HistorySidebar } from '@/components/HistorySidebar'
import { defaultSearchParams, type SearchParams } from '@/components/SearchSettingsModal'

import { 
  formatSimilarityResults, 
  formatImageSimilarityResults,
  formatChunksSimilarityResults,
  performImageSearch
} from '@/lib/api'

import { 
  generateEmbeddingsAction,
  searchSimilarPatentsAction,
  searchPatentsByChunksAction,
  searchPatentsByTextAction
} from '@/app/_actions/patent-actions'

import {
  saveAnalysisToHistory,
  type AnalysisHistory,
} from '@/lib/history'

import { processFile, type OCRProgress } from '@/lib/ocr'

type TabType = 'text' | 'image'

import { Sidebar } from '@/components/Sidebar'

function SearchParamsHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_failed') {
      toast.error('Falha na autenticação', {
        description: 'Não foi possível completar o login com Google. Verifique o console do servidor.'
      })
    }

    // Processa tokens de autenticação do fragmento da URL
    const processAuthTokens = async () => {
      console.log('🔍 [DEBUG] URL Hash:', window.location.hash)
      
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const expiresIn = hashParams.get('expires_in')
        
        console.log('🔍 [DEBUG] Access Token presente?', !!accessToken)
        console.log('🔍 [DEBUG] Refresh Token presente?', !!refreshToken)
        
        if (accessToken && refreshToken) {
          console.log('✅ [DEBUG] Tokens detectados! Criando sessão...')
          
          try {
            // Define a sessão manualmente usando a API do Supabase
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error('❌ [DEBUG] Erro ao definir sessão:', error)
              toast.error('Erro ao processar login')
            } else {
              console.log('✅ [DEBUG] Sessão criada com sucesso!', data.user?.email)
              toast.success('Login realizado com sucesso!')
            }
          } catch (err) {
            console.error('❌ [DEBUG] Exceção ao definir sessão:', err)
          }
          
          // Limpa o hash da URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
    }

    processAuthTokens()
  }, [searchParams])

  return null
}

export default function Home() {
  // Sidebar State
  const [sidebarTab, setSidebarTab] = useState('main')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const handleSidebarTabChange = (tab: string) => {
    if (tab === 'history') {
      const nextState = !isHistoryOpen
      setIsHistoryOpen(nextState)
      setSidebarTab(nextState ? 'history' : 'main')
    } else {
      setSidebarTab(tab)
      setIsHistoryOpen(false)
    }
  }

  const [activeTab, setActiveTab] = useState<TabType>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  
  // Search Settings State
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ...defaultSearchParams,
    searchType: 'similarity_full',
  })

  // Results & UI State
  const [result, setResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)
  const [processingStage, setProcessingStage] = useState<'ocr' | 'api' | 'similarity' | null>(null)

  // Derived State
  const hasResult = useMemo(() => result !== null, [result])
  const hasContent = useMemo(() => textInput.trim().length > 0 || selectedFile !== null, [textInput, selectedFile])

  // --- Handlers ---

  const handleTabChange = useCallback((newTab: string) => {
    const tab = newTab as TabType
    setActiveTab(tab)
    setSearchParams(prev => ({
      ...prev,
      searchType: tab === 'text' ? 'similarity_full' : 'image_search',
    }))
  }, [])

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
      const text = await processFile(selectedFile, setOcrProgress)
      setExtractedText(text)
      setTextInput((prev) => prev + (prev ? '\n\n' : '') + text)

      toast.success('Texto extraído!', {
        description: `${text.length.toLocaleString()} caracteres extraídos do arquivo.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar arquivo.'
      setError(msg)
      toast.error('Erro no OCR', { description: msg })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
      setOcrProgress(null)
    }
  }, [selectedFile])

  // --- Search Logic ---

  const handleTextSearch = useCallback(async () => {
    if (!textInput.trim()) {
      toast.error('Texto vazio', { description: 'Insira o texto para continuar.' })
      return
    }

    let formattedResult = ''
    let totalFound = 0

    const { searchType, similarity_threshold, max_results } = searchParams

    try {
      if (searchType === 'direct_text') {
        // Fluxo: Apenas /search/by-text
        setProcessingStage('similarity')
        const response = await searchPatentsByTextAction({
          text: textInput,
          similarity_threshold,
          max_results,
          use_chunks: false // Agora controlado pelo tipo de operação
        })
        formattedResult = formatSimilarityResults(response)
        totalFound = response.total_found
      } 
      else if (searchType === 'similarity_full' || searchType === 'chunks_processing') {
        // Fluxo: /embed -> (/similarity ou /chunks)
        setProcessingStage('api')
        const { embeddings } = await generateEmbeddingsAction({ text: textInput })
        
        if (!embeddings?.length) {
          throw new Error('Falha ao gerar embeddings: Nenhum embedding retornado.')
        }

        const embedding = embeddings[0]
        setProcessingStage('similarity')

        if (searchType === 'chunks_processing') {
          const response = await searchPatentsByChunksAction({
            embedding,
            similarity_threshold,
            max_results,
          })
          formattedResult = formatChunksSimilarityResults(response)
          totalFound = response.total_found
        } else {
          const response = await searchSimilarPatentsAction({
            embedding,
            similarity_threshold,
            max_results,
          })
          formattedResult = formatSimilarityResults(response)
          totalFound = response.total_found
        }
      }

      setResult(formattedResult)
      await saveAnalysisToHistory(textInput, formattedResult, 'text')
      
      toast.success('Busca concluída!', {
        description: `Encontrados ${totalFound} resultados relevantes.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro na busca.'
      setError(msg)
      toast.error('Erro na Operação', { description: msg })
      throw err // Repassa para o handleSubmit tratar o loading
    }
  }, [textInput, searchParams])

  const handleImageSearch = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Nenhum arquivo', { description: 'Selecione uma imagem para continuar.' })
      return
    }

    setProcessingStage('similarity')
    const response = await performImageSearch({
      file: selectedFile,
      similarity_threshold: searchParams.similarity_threshold,
      max_results: searchParams.max_results,
    })

    const formattedResult = formatImageSimilarityResults(response)
    setResult(formattedResult)
    await saveAnalysisToHistory(`Busca por imagem: ${selectedFile.name}`, formattedResult, 'image', selectedFile.name)

    toast.success('Busca concluída!', {
      description: `Encontradas ${response.total_found} imagens similares.`,
    })
  }, [selectedFile, searchParams.similarity_threshold, searchParams.max_results])

  const handleSubmit = useCallback(async () => {
    // Verifica se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast.error('Autenticação necessária', {
        description: 'Você precisa fazer login com Google para realizar buscas de patentes.',
        duration: 5000,
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      if (activeTab === 'text') {
        await handleTextSearch()
      } else {
        await handleImageSearch()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar.'
      setError(msg)
      toast.error('Erro', { description: msg })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
    }
  }, [activeTab, textInput, selectedFile, searchParams, handleTextSearch, handleImageSearch])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Sidebar activeTab={sidebarTab} onTabChange={handleSidebarTabChange} />
      <Header />

      <main className="pl-16 pt-16 min-h-screen flex relative">
        {/* Overlay para fechar o histórico ao clicar fora */}
        <div 
          className={cn(
            "absolute inset-0 bg-background/20 backdrop-blur-sm z-10 transition-all duration-300",
            isHistoryOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )} 
          onClick={() => {
            setIsHistoryOpen(false)
            setSidebarTab('main')
          }}
        />

        {/* Histórico como Painel Lateral (Sempre no DOM para animação suave) */}
        <div className={cn(
          "absolute inset-y-0 left-16 w-80 z-20 transition-all duration-300 ease-in-out border-r border-border shadow-2xl overflow-hidden",
          isHistoryOpen ? "translate-x-0 opacity-100 visibility-visible" : "-translate-x-full opacity-0 visibility-hidden"
        )}>
          <HistorySidebar 
            onClose={() => {
              setIsHistoryOpen(false)
              setSidebarTab('main')
            }}
            onSelectAnalysis={(analysis) => {
              handleSelectAnalysis(analysis)
              setIsHistoryOpen(false)
              setSidebarTab('main')
            }} 
          />
        </div>

        {hasResult && result ? (
          <AnalysisResultView
            result={result}
            onNewAnalysis={() => setResult(null)}
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
