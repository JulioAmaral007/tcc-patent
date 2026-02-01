'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { AnalysisResultView } from '@/components/AnalysisResultView'
import { getAnalysisById, type AnalysisHistory } from '@/lib/history'
import { HistorySidebar } from '@/components/HistorySidebar'
import { cn } from '@/lib/utils'

export default function ResultPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const [analysis, setAnalysis] = useState<AnalysisHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('main')

  useEffect(() => {
    async function loadAnalysis() {
      if (!id) {
        router.push('/')
        return
      }

      setLoading(true)
      try {
        const data = await getAnalysisById(id)
        if (!data) {
          router.push('/')
          return
        }
        setAnalysis(data)
      } catch (error) {
        console.error("Error loading analysis:", error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [id, router])

  const handleSidebarTabChange = (tab: string) => {
    if (tab === 'history') {
      const nextState = !isHistoryOpen
      setIsHistoryOpen(nextState)
      setSidebarTab(nextState ? 'history' : 'main')
    } else if (tab === 'patents') {
      router.push('/patents')
    } else if (tab === 'main') {
      router.push('/')
    } else {
      setSidebarTab(tab)
      setIsHistoryOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar activeTab={sidebarTab} onTabChange={handleSidebarTabChange} />
      <Header />
      
      <main className="pt-16 pb-16 md:pb-0 md:pl-16 min-h-[calc(100vh-4rem)] flex-1 flex relative">
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

        {/* Histórico como Painel Lateral */}
        <div className={cn(
          "absolute inset-y-0 left-0 md:left-16 w-full sm:w-80 z-20 transition-all duration-300 ease-in-out border-r border-border shadow-2xl overflow-hidden bg-background",
          isHistoryOpen ? "translate-x-0 opacity-100 visibility-visible" : "-translate-x-full opacity-0 visibility-hidden"
        )}>
          <HistorySidebar 
            onClose={() => {
              setIsHistoryOpen(false)
              setSidebarTab('main')
            }}
            onSelectAnalysis={(item) => {
              router.push(`/result/${item.id}`)
              setIsHistoryOpen(false)
              setSidebarTab('main')
            }} 
          />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : analysis ? (
          <AnalysisResultView
            result={analysis.result}
            onNewAnalysis={() => router.push('/')}
            conversationId={analysis.conversation_id}
          />
        ) : null}
      </main>
      
      <Footer />
    </div>
  )
}
