import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthButton } from '@/components/AuthButton'
import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-16 right-0 h-16 flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-border z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">Patent Analyzer</h1>
          <p className="text-xs text-muted-foreground">Processamento inteligente de patentes</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

