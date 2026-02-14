'use client'

import { FileText, History, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function Sidebar({ activeTab = 'main', onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'main', icon: FileText, label: 'Home' },
    { id: 'patents', icon: Database, label: 'Patents' },
    { id: 'history', icon: History, label: 'History' },
  ]

  return (
    <aside className="fixed bottom-0 left-0 w-full h-16 md:h-screen md:w-16 flex md:flex-col items-center justify-center md:py-6 bg-sidebar border-t md:border-t-0 md:border-r border-sidebar-border z-50">
      <div className="flex md:flex-col items-center justify-around md:justify-start gap-4 md:gap-6 flex-1 w-full md:mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={cn(
              'p-3 rounded-xl transition-all duration-200 group relative',
              activeTab === item.id
                ? 'bg-sidebar-accent text-primary glow-primary'
                : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent',
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute bottom-full md:bottom-auto md:left-full mb-3 md:mb-0 md:ml-3 px-2 py-1 rounded-md bg-popover text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
