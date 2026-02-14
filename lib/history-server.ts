'use server'

import type { AnalysisResultData } from './types'
import type { AnalysisHistory } from './history'
import { createClient } from './supabase-server'
import {
  formatSimilarityResults,
  formatChunksSimilarityResults,
  formatImageSimilarityResults,
} from './formatters'

/**
 * Busca uma análise pelo ID no servidor (apenas Supabase).
 * Usado pela página result/[id] como Server Component.
 */
export async function getAnalysisByIdServer(
  id: string,
): Promise<AnalysisHistory | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: row, error } = await supabase
    .from('api_request_history')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !row) return null

  const isImage = (row.endpoint as string).includes('images')
  const inputText = isImage
    ? row.request_payload?.filename || 'Imagem'
    : row.request_payload?.text || row.request_payload?.q || 'Busca por texto'

  let result =
    row.status === 'success' ? 'Análise concluída' : 'Erro na análise'
  if (row.status === 'success' && row.response_payload) {
    try {
      const ep = row.endpoint as string
      if (
        ep.includes('/search/by-text') ||
        ep.includes('/patents/similarity')
      ) {
        result = formatSimilarityResults(row.response_payload)
      } else if (ep.includes('/chunks/similarity')) {
        result = formatChunksSimilarityResults(row.response_payload)
      } else if (ep.includes('/images/search')) {
        result = formatImageSimilarityResults(row.response_payload)
      }
    } catch {
      // keep default result
    }
  }

  return {
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    inputText,
    result,
    response_payload: row.response_payload as AnalysisResultData | undefined,
    inputType: isImage ? 'image' : 'text',
    fileName: isImage ? row.request_payload?.filename : undefined,
    conversation_id: row.conversation_id,
    endpoint: row.endpoint,
    request_payload: row.request_payload,
    source: 'supabase',
  }
}
