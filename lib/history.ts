import { supabase } from './supabase'
import { fetchUserHistory, deleteHistoryItem } from './history-service'
import { 
  formatSimilarityResults, 
  formatChunksSimilarityResults, 
  formatImageSimilarityResults 
} from './api'

export interface AnalysisHistory {
  id: string
  timestamp: number
  inputText: string
  result: string
  inputType: 'text' | 'image'
  fileName?: string
  conversation_id?: string
  endpoint?: string
  request_payload?: any
  response_payload?: any
}

const STORAGE_KEY = 'patent-analysis-history'
const MAX_HISTORY_ITEMS = 50

/**
 * Salva uma nova análise no histórico local.
 * O log no Supabase agora é automático via Server Actions (api_request_history).
 */
export async function saveAnalysisToHistory(
  inputText: string,
  result: string,
  inputType: 'text' | 'image' = 'text',
  fileName?: string,
  extra?: {
    conversation_id?: string
    endpoint?: string
    request_payload?: any
    response_payload?: any
  }
): Promise<AnalysisHistory> {
  const analysis: AnalysisHistory = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    inputText,
    result,
    inputType,
    fileName,
    conversation_id: extra?.conversation_id,
    endpoint: extra?.endpoint,
    request_payload: extra?.request_payload,
    response_payload: extra?.response_payload
  }

  // Sempre salva no localStorage para persistência offline/convidado
  const localHistory = getLocalHistory()
  const newLocalHistory = [analysis, ...localHistory].slice(0, MAX_HISTORY_ITEMS)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocalHistory))
  } catch (error) {
    console.error('Erro ao salvar histórico local:', error)
  }

  return analysis
}

/**
 * Recupera o histórico (LocalStorage ou Supabase)
 */
export async function getFullHistory(): Promise<AnalysisHistory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const supabaseItems = await fetchUserHistory()
      return supabaseItems.map(item => {
        const isImage = item.endpoint.includes('images')
        const inputText = isImage 
          ? (item.request_payload.filename || 'Imagem')
          : (item.request_payload.text || item.request_payload.q || 'Busca por texto')
        
        let result = item.status === 'success' ? 'Análise concluída' : 'Erro na análise'
        
        // Reconstrói o resultado formatado a partir do payload de resposta salvo
        if (item.status === 'success' && item.response_payload) {
          try {
            if (item.endpoint.includes('/search/by-text') || item.endpoint.includes('/patents/similarity')) {
              result = formatSimilarityResults(item.response_payload)
            } else if (item.endpoint.includes('/chunks/similarity')) {
              result = formatChunksSimilarityResults(item.response_payload)
            } else if (item.endpoint.includes('/images/search')) {
              result = formatImageSimilarityResults(item.response_payload)
            }
          } catch (e) {
            console.error('Erro ao formatar resultado do histórico:', e)
          }
        }
        
        return {
          id: item.id,
          timestamp: new Date(item.created_at).getTime(),
          inputText: inputText,
          result: result,
          inputType: isImage ? 'image' : 'text',
          fileName: isImage ? item.request_payload.filename : undefined,
          conversation_id: item.conversation_id,
          endpoint: item.endpoint,
          request_payload: item.request_payload
        }
      }) as AnalysisHistory[]
    }
  } catch (error) {
    console.error('Erro ao buscar histórico do Supabase, usando local:', error)
  }

  return getLocalHistory()
}

/**
 * Funções auxiliares internas
 */
function getLocalHistory(): AnalysisHistory[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const history = JSON.parse(stored) as AnalysisHistory[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    return []
  }
}

// Mantendo compatibilidade com as funções antigas mas adaptando-as
export function getAnalysisHistory(): AnalysisHistory[] {
  return getLocalHistory()
}

export async function removeAnalysisFromHistory(id: string): Promise<boolean> {
  try {
    // Tenta remover do Supabase se for um ID de UUID (tamanho padrão > 30)
    if (id.length > 20) { 
      await deleteHistoryItem(id)
    }
    
    // Sempre tenta remover do local
    const history = getLocalHistory()
    const filtered = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Erro ao remover do histórico:', error)
    return false
  }
}

export function formatAnalysisDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} h ago`
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getTextPreview(text: string | undefined | null, maxLength: number = 60): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
