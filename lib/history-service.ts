import { supabase } from './supabase'

export interface HistoryItem {
  id: string
  user_id: string
  conversation_id: string | null
  endpoint: string
  similarity_threshold: number
  max_results_requested: number
  total_files_returned: number
  request_payload: any
  response_payload: any
  latency_ms: number
  status: 'success' | 'error'
  error_message: string | null
  created_at: string
}

/**
 * Busca o histórico do usuário logado na nova tabela api_request_history
 */
export async function fetchUserHistory() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('api_request_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching history:', error.message)
    throw error
  }

  return data as HistoryItem[]
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
