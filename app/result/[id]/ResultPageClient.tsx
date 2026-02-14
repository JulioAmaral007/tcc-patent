'use client'

import { useEffect, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { AnalysisResultView } from '@/components/AnalysisResultView'
import { getAnalysisById, type AnalysisHistory } from '@/lib/history'

type ResultPageClientProps = {
  id: string
}

export function ResultPageClient({ id }: ResultPageClientProps) {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<AnalysisHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalysis() {
      if (!id) {
        notFound()
        return
      }

      setLoading(true)
      try {
        const data = await getAnalysisById(id)
        if (!data) {
          notFound()
          return
        }
        setAnalysis(data)
      } catch (error) {
        console.error('Error loading analysis:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [id])

  if (loading) {
    return (
      <AppLayout activePage="result">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <AppLayout activePage="result">
      <AnalysisResultView
        inputText={analysis.inputText}
        result={analysis.result}
        resultData={analysis.response_payload ?? undefined}
        onNewAnalysis={() => router.push('/')}
        conversationId={analysis.conversation_id}
      />
    </AppLayout>
  )
}
