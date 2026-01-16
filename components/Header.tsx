import { ThemeToggle } from '@/components/ThemeToggle'
import Image from 'next/image'

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm z-50 shrink-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-glow">
              <Image src="/icon.png" alt="Patent Analyzer Logo" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Patent Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                Processamento inteligente de patentes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

