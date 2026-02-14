'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { HistorySidebar } from '@/components/HistorySidebar/HistorySidebar'
import { useSidebarNavigation } from '@/hooks/useSidebarNavigation'
import { cn } from '@/lib/utils'

export type AppLayoutPage = 'main' | 'patents' | 'result'

interface AppLayoutProps {
  children: React.ReactNode
  activePage: AppLayoutPage
}

export function AppLayout({ children, activePage }: AppLayoutProps) {
  const {
    sidebarActiveTab,
    handleSidebarTabChange,
    isHistoryOpen,
    closeHistory,
    handleSelectAnalysis,
  } = useSidebarNavigation(activePage)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar
        activeTab={sidebarActiveTab}
        onTabChange={handleSidebarTabChange}
      />
      <Header />

      <main className="pt-16 pb-16 md:pb-0 md:pl-16 min-h-screen flex-1 flex relative">
        {/* Overlay to close history when clicking outside */}
        <div
          className={cn(
            'absolute inset-0 bg-background/20 backdrop-blur-sm z-10 transition-all duration-300',
            isHistoryOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none',
          )}
          onClick={closeHistory}
          aria-hidden
        />

        {/* History side panel */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 md:left-16 w-full sm:w-80 z-20 transition-all duration-300 ease-in-out border-r border-border shadow-2xl overflow-hidden bg-background',
            isHistoryOpen
              ? 'translate-x-0 opacity-100 visibility-visible'
              : '-translate-x-full opacity-0 visibility-hidden',
          )}
        >
          <HistorySidebar
            onClose={closeHistory}
            onSelectAnalysis={handleSelectAnalysis}
          />
        </div>

        {children}
      </main>

      <Footer />
    </div>
  )
}
