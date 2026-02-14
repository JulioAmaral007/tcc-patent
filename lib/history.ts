import type {
  AnalysisResultData,
  SearchByTextResponse,
  ChunksSimilarityResponse,
  ImagesSearchResponse,
} from './types'
import { supabase } from './supabase'
import {
  fetchUserHistory,
  fetchHistoryItemById,
  deleteHistoryItem,
  type HistoryItem,
} from './history-service'
import {
  formatSimilarityResults,
  formatChunksSimilarityResults,
  formatImageSimilarityResults,
} from './formatters'

export interface AnalysisHistory {
  id: string
  timestamp: number
  inputText: string
  /** Texto formatado para clipboard e PDF */
  result: string
  /** Dados estruturados para renderização (evita parse por regex) */
  response_payload?: AnalysisResultData
  inputType: 'text' | 'image'
  fileName?: string
  conversation_id?: string
  endpoint?: string
  request_payload?: Record<string, unknown>
  /** Origem do item: local (localStorage) ou supabase. Usado para decidir onde remover. */
  source?: 'local' | 'supabase'
}

const STORAGE_KEY = 'patent-analysis-history'
const MAX_HISTORY_ITEMS = 20
/** Tamanho máximo do texto de resultado por item no localStorage (evita QuotaExceededError) */
const MAX_STORED_RESULT_LENGTH = 15_000

/** Item enxuto para persistir (sem response_payload, result truncado). */
type StoredHistoryItem = Omit<AnalysisHistory, 'response_payload'> & {
  result: string
}

function toStoredItem(item: AnalysisHistory): StoredHistoryItem {
  const result =
    item.result.length <= MAX_STORED_RESULT_LENGTH
      ? item.result
      : item.result.slice(0, MAX_STORED_RESULT_LENGTH) + '\n\n[... truncado]'
  return {
    id: item.id,
    timestamp: item.timestamp,
    inputText: item.inputText,
    result,
    inputType: item.inputType,
    fileName: item.fileName,
    conversation_id: item.conversation_id,
    endpoint: item.endpoint,
    request_payload: item.request_payload,
    source: item.source,
  }
}

/**
 * Salva uma nova análise no histórico local.
 * Persiste versão enxuta para não exceder cota do localStorage.
 */
export async function saveAnalysisToHistory(
  inputText: string,
  result: string,
  inputType: 'text' | 'image' = 'text',
  fileName?: string,
  extra?: {
    conversation_id?: string
    endpoint?: string
    request_payload?: Record<string, unknown>
    response_payload?: AnalysisResultData
  },
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
    response_payload: extra?.response_payload,
    source: 'local',
  }

  const localHistory = getLocalHistory()
  let list = [analysis, ...localHistory].slice(0, MAX_HISTORY_ITEMS)
  let toStore: StoredHistoryItem[] = list.map(toStoredItem)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      for (const limit of [10, 5, 3]) {
        list = list.slice(0, limit)
        toStore = list.map(toStoredItem)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
          break
        } catch {
          /* próxima tentativa com menos itens */
        }
      }
    } else {
      console.error('Erro ao salvar histórico local:', error)
    }
  }

  return analysis
}

/**
 * Recupera o histórico (LocalStorage ou Supabase)
 */
export async function getFullHistory(): Promise<AnalysisHistory[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const supabaseItems = await fetchUserHistory()
      return supabaseItems.map((item) => {
        const isImage = item.endpoint.includes('images')
        const reqPayload = item.request_payload ?? {}
        const inputText = isImage
          ? String(reqPayload.filename ?? 'Imagem')
          : String(reqPayload.text ?? reqPayload.q ?? 'Busca por texto')
        return {
          id: item.id,
          timestamp: new Date(item.created_at).getTime(),
          inputText,
          result:
            item.status === 'success' ? 'Análise concluída' : 'Erro na análise',
          response_payload: undefined as AnalysisResultData | undefined,
          inputType: (isImage ? 'image' : 'text') as 'text' | 'image',
          fileName: isImage ? String(reqPayload.filename ?? '') : undefined,
          conversation_id: item.conversation_id ?? undefined,
          endpoint: item.endpoint,
          request_payload: reqPayload as Record<string, unknown>,
          source: 'supabase' as const,
        }
      }) as AnalysisHistory[]
    }
  } catch (error) {
    console.error('Erro ao buscar histórico do Supabase, usando local:', error)
  }

  return getLocalHistory()
}

function mapHistoryItemToAnalysis(item: HistoryItem): AnalysisHistory {
  const isImage = item.endpoint.includes('images')
  const reqPayload = item.request_payload ?? {}
  const inputText = isImage
    ? String(reqPayload.filename || 'Imagem')
    : String(reqPayload.text ?? reqPayload.q ?? 'Busca por texto')
  let result =
    item.status === 'success' ? 'Análise concluída' : 'Erro na análise'
  const payload = item.response_payload as AnalysisResultData | undefined
  if (item.status === 'success' && payload) {
    try {
      if (
        item.endpoint.includes('/search/by-text') ||
        item.endpoint.includes('/patents/similarity')
      ) {
        result = formatSimilarityResults(payload as SearchByTextResponse)
      } else if (item.endpoint.includes('/chunks/similarity')) {
        result = formatChunksSimilarityResults(
          payload as ChunksSimilarityResponse,
        )
      } else if (item.endpoint.includes('/images/search')) {
        result = formatImageSimilarityResults(payload as ImagesSearchResponse)
      }
    } catch (e) {
      console.error('Erro ao formatar resultado do histórico:', e)
    }
  }
  return {
    id: item.id,
    timestamp: new Date(item.created_at).getTime(),
    inputText,
    result,
    response_payload: payload,
    inputType: isImage ? 'image' : 'text',
    fileName: isImage ? String(reqPayload.filename ?? '') : undefined,
    conversation_id: item.conversation_id ?? undefined,
    endpoint: item.endpoint,
    request_payload: reqPayload as Record<string, unknown>,
    source: 'supabase',
  }
}

/**
 * Recupera uma análise específica pelo ID.
 * Para itens do Supabase, carrega o item completo (com response_payload) na abertura do detalhe.
 */
export async function getAnalysisById(
  id: string,
): Promise<AnalysisHistory | null> {
  const localItems = getLocalHistory()
  const localMatch = localItems.find((item) => item.id === id)
  if (localMatch) return localMatch

  const history = await getFullHistory()
  const found = history.find((item) => item.id === id)
  if (!found) return null

  if (found.source === 'supabase') {
    const fullItem = await fetchHistoryItemById(found.id)
    if (fullItem) return mapHistoryItemToAnalysis(fullItem)
  }
  return found
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
  } catch {
    return []
  }
}

// Mantendo compatibilidade com as funções antigas mas adaptando-as
export function getAnalysisHistory(): AnalysisHistory[] {
  return getLocalHistory()
}

export async function removeAnalysisFromHistory(id: string): Promise<boolean> {
  try {
    const item = await getAnalysisById(id)
    if (item?.source === 'supabase') {
      await deleteHistoryItem(id)
    }

    const history = getLocalHistory()
    const filtered = history.filter((h) => h.id !== id)
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

export function getTextPreview(
  text: string | undefined | null,
  maxLength: number = 60,
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
