'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AppLayoutPage } from '@/components/layout'
import type { AnalysisHistory } from '@/lib/history'

export function useSidebarNavigation(activePage: AppLayoutPage) {
  const router = useRouter()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const sidebarActiveTab = isHistoryOpen
    ? 'history'
    : activePage === 'patents'
      ? 'patents'
      : 'main'

  const handleSidebarTabChange = useCallback(
    (tab: string) => {
      if (tab === 'history') {
        setIsHistoryOpen((prev) => !prev)
      } else if (tab === 'patents') {
        router.push('/patents')
      } else {
        setIsHistoryOpen(false)
        router.push('/')
      }
    },
    [router],
  )

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false)
  }, [])

  const handleSelectAnalysis = useCallback(
    (analysis: AnalysisHistory) => {
      router.push(`/result/${analysis.id}`)
      setIsHistoryOpen(false)
    },
    [router],
  )

  return {
    sidebarActiveTab,
    handleSidebarTabChange,
    isHistoryOpen,
    closeHistory,
    handleSelectAnalysis,
  }
}
