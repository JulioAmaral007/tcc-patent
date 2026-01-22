// Utilitário para gerenciar histórico de análises (LocalStorage + Supabase)
import { supabase } from './supabase'
import { saveHistoryItem, fetchUserHistory, deleteHistoryItem } from './history-service'

export interface AnalysisHistory {
  id: string
  timestamp: number
  inputText: string
  result: string
  inputType: 'text' | 'image'
  fileName?: string
}

const STORAGE_KEY = 'patent-analysis-history'
const MAX_HISTORY_ITEMS = 50

/**
 * Salva uma nova análise no histórico
 * Se o usuário estiver logado, salva no Supabase. Caso contrário, apenas no localStorage.
 */
export async function saveAnalysisToHistory(
  inputText: string,
  result: string,
  inputType: 'text' | 'image' = 'text',
  fileName?: string,
): Promise<AnalysisHistory> {
  const analysis: AnalysisHistory = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    inputText,
    result,
    inputType,
    fileName,
  }

  // Sempre salva no localStorage para persistência offline/convidado
  const localHistory = getLocalHistory()
  const newLocalHistory = [analysis, ...localHistory].slice(0, MAX_HISTORY_ITEMS)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocalHistory))
  } catch (error) {
    console.error('Erro ao salvar histórico local:', error)
  }

  // Tenta salvar no Supabase se estiver logado
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await saveHistoryItem(analysis)
    }
  } catch (error) {
    console.error('Erro ao sincronizar com Supabase:', error)
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
      return supabaseItems.map(item => ({
        ...item.content,
        id: item.id, // Usa o ID do banco de dados
      })) as AnalysisHistory[]
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
    // Tenta remover do Supabase se for um ID de UUID
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

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins} min atrás`
  if (diffHours < 24) return `${diffHours} h atrás`
  if (diffDays < 7) return `${diffDays} dias atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getTextPreview(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
