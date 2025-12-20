'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatPanelProps {
  analysisResult: string
  inputText: string
}

export function ChatPanel({ analysisResult, inputText }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simula uma resposta da IA baseada no contexto da análise
    // Em produção, isso seria uma chamada à API
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: generateResponse(userMessage.content, analysisResult),
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex-1 flex flex-col bg-card overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Chat sobre a Análise
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Faça perguntas sobre o resultado da análise
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Inicie uma conversa
              </p>
              <p className="text-xs text-muted-foreground">
                Faça perguntas sobre a análise para obter mais informações
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-accent rounded-lg p-3 max-w-[80%]">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta sobre a análise..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gap-2 gradient-primary shrink-0"
            size="lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </Card>
  )
}

// Função auxiliar para gerar respostas baseadas no contexto
// Em produção, isso seria substituído por uma chamada à API
function generateResponse(question: string, analysisResult: string): string {
  const lowerQuestion = question.toLowerCase()

  // Respostas contextuais baseadas em palavras-chave
  if (
    lowerQuestion.includes('resumo') ||
    lowerQuestion.includes('resumir') ||
    lowerQuestion.includes('sumarizar')
  ) {
    const lines = analysisResult.split('\n').slice(0, 10)
    return `Com base na análise, aqui está um resumo:\n\n${lines.join('\n')}\n\n...\n\nPara mais detalhes, consulte o painel de resultados à direita.`
  }

  if (
    lowerQuestion.includes('estatística') ||
    lowerQuestion.includes('número') ||
    lowerQuestion.includes('quantidade')
  ) {
    const statsMatch = analysisResult.match(/ESTATÍSTICAS[\s\S]*?(?=═|$)/i)
    if (statsMatch) {
      return `As estatísticas da análise são:\n\n${statsMatch[0]}\n\nEssas informações estão disponíveis no resultado completo.`
    }
    return 'As estatísticas estão disponíveis na seção "ESTATÍSTICAS" do resultado da análise. Consulte o painel à direita para ver os detalhes completos.'
  }

  if (
    lowerQuestion.includes('explicar') ||
    lowerQuestion.includes('como') ||
    lowerQuestion.includes('o que')
  ) {
    return `Com base na análise realizada, posso explicar que:\n\nA análise processou o texto da patente e gerou um relatório detalhado com resumo, conteúdo extraído e estatísticas. Para informações mais específicas, você pode fazer perguntas mais direcionadas ou consultar o resultado completo no painel à direita.`
  }

  if (
    lowerQuestion.includes('palavra') ||
    lowerQuestion.includes('caractere') ||
    lowerQuestion.includes('tamanho')
  ) {
    const wordMatch = analysisResult.match(/Palavras: ([\d.,]+)/i)
    const charMatch = analysisResult.match(/Caracteres: ([\d.,]+)/i)
    
    let response = 'Informações sobre o tamanho do texto:\n\n'
    if (wordMatch) response += `• Palavras: ${wordMatch[1]}\n`
    if (charMatch) response += `• Caracteres: ${charMatch[1]}\n`
    response += '\nEssas informações estão disponíveis no resultado completo da análise.'
    
    return response
  }

  // Resposta padrão
  return `Com base na análise realizada, posso ajudar você a entender melhor os resultados. A análise processou o texto da patente e gerou informações detalhadas.\n\nPara informações mais específicas, você pode:\n• Perguntar sobre estatísticas\n• Solicitar um resumo\n• Fazer perguntas sobre o conteúdo\n\nOu consulte o painel de resultados à direita para ver todos os detalhes.`
}

