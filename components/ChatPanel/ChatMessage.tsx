'use client'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl transition-all hover:scale-[1.01] ${
          role === 'user'
            ? 'bg-primary text-primary-foreground shadow-glow'
            : 'bg-muted/80 text-foreground border border-border/50 backdrop-blur-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
