'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Bot } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { processChatWithAIAction, fetchMessagesAction } from '@/app/_actions/chat-actions'
import { ChatMessage } from './ChatMessage'

interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatPanelProps {
  analysisResult: string
  initialConversationId?: string
}

export function ChatPanel({ analysisResult, initialConversationId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [conversationId] = useState(() => {
    return initialConversationId || crypto.randomUUID() 
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchMessagesAction(conversationId)
        if (history.length > 0) {
          setMessages(history as ChatMessageData[])
        }
      } catch (err) {
        console.error("Error loading history:", err)
      }
    }
    loadHistory()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessageData = {
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
      const responseText = await processChatWithAIAction(
        conversationId, 
        currentInput, 
        analysisResult
      );

      const assistantMessage: ChatMessageData = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: responseText ?? '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Error getting AI response.')
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
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-semibold text-foreground">Analysis Chat</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions about the analysis result
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-custom">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Start a conversation</h4>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Ask questions about the analysis to get more information
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                role={message.role} 
                content={message.content} 
              />
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

      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
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
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
