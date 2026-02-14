import { supabase } from './supabase'

export interface HistoryItem {
  id: string
  user_id: string
  conversation_id: string | null
  endpoint: string
  similarity_threshold: number
  max_results_requested: number
  total_files_returned: number
  request_payload: {
    filename?: string
    text?: string
    q?: string
    [key: string]: unknown
  }
  response_payload: unknown
  latency_ms: number
  status: 'success' | 'error'
  error_message: string | null
  created_at: string
}

/** Listagem com request_payload para mostrar texto/nome do arquivo no card (sem response_payload) */
const LIST_COLUMNS =
  'id, user_id, conversation_id, endpoint, similarity_threshold, max_results_requested, total_files_returned, request_payload, latency_ms, status, error_message, created_at'

/**
 * Busca o histórico do usuário (sem response_payload) para evitar respostas truncadas/corrompidas.
 */
export async function fetchUserHistory() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('api_request_history')
    .select(LIST_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching history:', error.message)
    throw error
  }

  return data as Omit<HistoryItem, 'response_payload'>[]
}

/**
 * Busca um item por ID com todos os campos (incluindo response_payload) para a página de detalhe.
 */
export async function fetchHistoryItemById(
  id: string,
): Promise<HistoryItem | null> {
  const { data, error } = await supabase
    .from('api_request_history')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as HistoryItem
}

/**
 * Deleta um item do histórico (permitido pelo RLS se necessário,
 * mas geralmente logs são permanentes. Mantendo para compatibilidade de UI se houver botão de excluir)
 */
export async function deleteHistoryItem(id: string) {
  const { error } = await supabase
    .from('api_request_history')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting history item:', error.message)
    throw error
  }
}
