'use client'

import { useCallback, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import { AnalysisInputView } from '@/components/AnalysisInputView'
import { AppLayout } from '@/components/layout'
import {
  defaultSearchParams,
  type SearchParams,
} from '@/components/SearchSettingsModal'

import {
  formatSimilarityResults,
  formatImageSimilarityResults,
  formatChunksSimilarityResults,
} from '@/lib/formatters'

import {
  searchPatentsByTextAction,
  searchPatentsByChunksWithTextAction,
  searchSimilarPatentsWithTextAction,
  searchSimilarImagesAction,
} from '@/app/_actions/patent-actions'

import type { AnalysisResultData } from '@/lib/types'
import { saveAnalysisToHistory } from '@/lib/history'

type TabType = 'text' | 'image'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Search Settings State
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ...defaultSearchParams,
    searchType: 'similarity_full',
  })

  // Results & UI State
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >(undefined)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<
    'api' | 'similarity' | null
  >(null)

  // Derived State
  const hasContent = useMemo(
    () => textInput.trim().length > 0 || selectedFile !== null,
    [textInput, selectedFile],
  )

  // --- Handlers ---

  const handleTabChange = useCallback((newTab: string) => {
    const tab = (
      newTab === 'text' || newTab === 'image' ? newTab : 'text'
    ) as TabType
    setActiveTab(tab)
    setSearchParams((prev) => ({
      ...prev,
      searchType: tab === 'text' ? 'similarity_full' : 'image_search',
    }))
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setError(null)
  }, [])

  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    setError(null)
  }, [])

  const handleClearAll = useCallback(() => {
    setTextInput('')
    setSelectedFile(null)
    setCurrentConversationId(undefined)
    setError(null)
    setProcessingStage(null)
  }, [])

  // --- Search Logic ---

  const handleTextSearch = useCallback(async () => {
    if (!textInput.trim()) {
      toast.error('Empty text', { description: 'Insert text to continue.' })
      return
    }

    const conversationId = currentConversationId || crypto.randomUUID()
    setCurrentConversationId(conversationId)

    let formattedResult = ''
    let totalFound = 0
    let responsePayload: AnalysisResultData | undefined

    const { searchType, similarity_threshold, max_results } = searchParams

    try {
      if (searchType === 'direct_text') {
        setProcessingStage('similarity')
        const response = await searchPatentsByTextAction({
          text: textInput,
          similarity_threshold,
          max_results,
          use_chunks: false,
          conversation_id: conversationId,
        })
        responsePayload = response
        formattedResult = formatSimilarityResults(response)
        totalFound = response.total_found
      } else if (
        searchType === 'similarity_full' ||
        searchType === 'chunks_processing'
      ) {
        setProcessingStage('api')
        if (searchType === 'chunks_processing') {
          const response = await searchPatentsByChunksWithTextAction({
            text: textInput,
            max_results,
            similarity_threshold,
            conversation_id: conversationId,
          })
          responsePayload = response
          formattedResult = formatChunksSimilarityResults(response)
          totalFound = response.total_found
        } else {
          const response = await searchSimilarPatentsWithTextAction({
            text: textInput,
            max_results,
            similarity_threshold,
            conversation_id: conversationId,
          })
          responsePayload = response
          formattedResult = formatSimilarityResults(response)
          totalFound = response.total_found
        }
      }

      const endpoint =
        searchType === 'direct_text'
          ? '/v1/patents/search/by-text'
          : searchType === 'chunks_processing'
            ? '/v1/patents/chunks/similarity'
            : '/v1/patents/similarity'

      const request_payload =
        searchType === 'direct_text'
          ? {
              text: textInput,
              similarity_threshold,
              max_results,
              use_chunks: false,
            }
          : { text: textInput, max_results, similarity_threshold }

      const savedAnalysis = await saveAnalysisToHistory(
        textInput,
        formattedResult,
        'text',
        undefined,
        {
          conversation_id: conversationId,
          endpoint,
          request_payload,
          response_payload: responsePayload,
        },
      )

      toast.success('Search complete!', {
        description: `Found ${totalFound} relevant results.`,
      })

      return savedAnalysis
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search error.'
      setError(msg)
      toast.error('Operation Error', { description: msg })
      throw err
    }
  }, [textInput, searchParams, currentConversationId])

  const handleImageSearch = useCallback(async () => {
    if (!selectedFile) {
      toast.error('No file', { description: 'Select an image to continue.' })
      return
    }

    const conversationId = currentConversationId || crypto.randomUUID()
    setCurrentConversationId(conversationId)

    setProcessingStage('similarity')

    const arrayBuffer = await selectedFile.arrayBuffer()
    const response = await searchSimilarImagesAction(
      arrayBuffer,
      selectedFile.name,
      searchParams.similarity_threshold,
      searchParams.max_results,
      conversationId,
    )

    const formattedResult = formatImageSimilarityResults(response)

    const savedAnalysis = await saveAnalysisToHistory(
      `Image search: ${selectedFile.name}`,
      formattedResult,
      'image',
      selectedFile.name,
      {
        conversation_id: conversationId,
        endpoint: '/v1/patents/images/search',
        request_payload: {
          filename: selectedFile.name,
          similarity_threshold: searchParams.similarity_threshold,
          max_results: searchParams.max_results,
        },
        response_payload: response,
      },
    )

    toast.success('Search complete!', {
      description: `Found ${response.total_found} similar images.`,
    })

    return savedAnalysis
  }, [
    selectedFile,
    searchParams.similarity_threshold,
    searchParams.max_results,
    currentConversationId,
  ])

  const handleSubmit = useCallback(async () => {
    // Verifica se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      toast.error('Authentication required', {
        description:
          'You need to sign in with Google to perform patent searches.',
        duration: 5000,
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let savedAnalysis
      if (activeTab === 'text') {
        savedAnalysis = await handleTextSearch()
      } else {
        savedAnalysis = await handleImageSearch()
      }

      if (savedAnalysis) {
        router.push(`/result/${savedAnalysis.id}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error processing.'
      setError(msg)
      toast.error('Error', { description: msg })
    } finally {
      setIsProcessing(false)
      setProcessingStage(null)
    }
  }, [activeTab, handleTextSearch, handleImageSearch, router])

  return (
    <AppLayout activePage="main">
      <AnalysisInputView
        activeTab={activeTab}
        onTabChange={handleTabChange}
        textInput={textInput}
        onTextInputChange={setTextInput}
        isProcessing={isProcessing}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onClearFile={handleClearFile}
        hasContent={hasContent}
        onClearAll={handleClearAll}
        searchParams={searchParams}
        onSearchParamsChange={setSearchParams}
        onSubmit={handleSubmit}
        processingStage={processingStage}
        error={error}
        onDismissError={() => setError(null)}
      />
    </AppLayout>
  )
}
