'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Bot, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { processarChatComIAAction, buscarMensagensAction } from '@/app/_actions/chat-actions'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatPanelProps {
  analysisResult: string
}

export function ChatPanel({ analysisResult }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Geramos um ID estável baseado no resultado da análise ou um ID persistente
  // Geramos um ID estável baseado no resultado da análise ou um ID persistente
  const [conversationId] = useState(() => {
    return crypto.randomUUID() 
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carrega o histórico ao montar o componente
  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const historico = await buscarMensagensAction(conversationId)
        if (historico.length > 0) {
          setMessages(historico)
        }
      } catch (err) {
        console.error("Error loading history:", err)
      }
    }
    carregarHistorico()
  }, [conversationId])

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
    const currentInput = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Chamada real para o Gemini via Server Action
      const responseText = await processarChatComIAAction(
        conversationId, 
        currentInput, 
        analysisResult
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: responseText ?? '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro no chat:', error)
      toast.error('Erro ao obter resposta da IA.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col glass-effect rounded-2xl overflow-hidden shadow-soft">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-semibold text-foreground">Chat sobre a Análise</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Faça perguntas sobre o resultado da análise
        </p>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 scrollbar-custom" 
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Inicie uma conversa</h4>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Faça perguntas sobre a análise para obter mais informações
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl transition-all hover:scale-[1.01] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'bg-muted/80 text-foreground border border-border/50 backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                <div className="flex gap-1.5 h-4 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-input/50 border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[44px] w-[44px] p-0 rounded-xl gradient-primary text-primary-foreground shrink-0 shadow-glow hover:opacity-90 transition-all"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-1">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
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

