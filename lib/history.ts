// Utilitário para gerenciar histórico de análises no localStorage

export interface AnalysisHistory {
  id: string
  timestamp: number
  inputText: string
  result: string
  inputType: 'text' | 'image'
  fileName?: string
}

const STORAGE_KEY = 'patent-analysis-history'
const MAX_HISTORY_ITEMS = 50 // Limite de análises no histórico

/**
 * Salva uma nova análise no histórico
 */
export function saveAnalysisToHistory(
  inputText: string,
  result: string,
  inputType: 'text' | 'image' = 'text',
  fileName?: string,
): AnalysisHistory {
  const analysis: AnalysisHistory = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    inputText,
    result,
    inputType,
    fileName,
  }

  const history = getAnalysisHistory()
  
  // Adiciona no início (mais recente primeiro)
  const newHistory = [analysis, ...history].slice(0, MAX_HISTORY_ITEMS)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  } catch (error) {
    console.error('Erro ao salvar histórico:', error)
  }

  return analysis
}

/**
 * Recupera todo o histórico de análises
 */
export function getAnalysisHistory(): AnalysisHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored) as AnalysisHistory[]
    // Garante que está ordenado por timestamp (mais recente primeiro)
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Erro ao recuperar histórico:', error)
    return []
  }
}

/**
 * Remove uma análise do histórico pelo ID
 */
export function removeAnalysisFromHistory(id: string): boolean {
  try {
    const history = getAnalysisHistory()
    const filtered = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Erro ao remover análise do histórico:', error)
    return false
  }
}

/**
 * Limpa todo o histórico
 */
export function clearAnalysisHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Erro ao limpar histórico:', error)
    return false
  }
}

/**
 * Formata a data para exibição
 */
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

/**
 * Gera um preview do texto (primeiras palavras)
 */
export function getTextPreview(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

