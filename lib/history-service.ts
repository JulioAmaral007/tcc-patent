import { supabase } from './supabase'

export interface HistoryItem {
  id?: string
  user_id?: string
  content: any
  created_at?: string
}

/**
 * Busca o histórico do usuário logado
 */
export async function fetchUserHistory() {
  // Garantimos que o usuário está validado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar histórico:', error.message)
    throw error
  }

  return data as HistoryItem[]
}

/**
 * Salva um novo item no histórico vinculado ao usuário atual
 */
export async function saveHistoryItem(content: any) {
  // O getUser() é o método mais seguro para validar o JWT no client
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Usuário não autenticado para salvar histórico')
  }

  const { data, error } = await supabase
    .from('history')
    .insert([
      { 
        user_id: user.id, 
        content: content 
      }
    ])
    .select()

  if (error) {
    console.error('Erro ao salvar item no histórico:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Deleta um item do histórico
 */
export async function deleteHistoryItem(id: string) {
  const { error } = await supabase
    .from('history')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar item do histórico:', error.message)
    throw error
  }
}
