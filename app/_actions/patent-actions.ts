'use server'

import { createClient } from '@/lib/supabase-server'
import { externalApiClient } from '@/lib/patent-api-utils'
import { 
  SearchByTextParams, 
  SearchByTextResponse, 
  ImagesSearchResponse,
  EmbedParams,
  EmbedResponse,
  PatentsSimilarityParams,
  PatentsSimilarityResponse,
  ChunksSimilarityParams,
  ChunksSimilarityResponse,
  ListPatentsParams,
  ListPatentsResponse,
  PatentImagesResponse
} from '@/lib/types'

async function logApiRequest(params: {
  endpoint: string
  similarity_threshold: number
  max_results_requested: number
  total_files_returned: number
  request_payload: any
  response_payload: any
  latency_ms: number
  status: 'success' | 'error'
  error_message?: string
  conversation_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Garantir que a conversa existe se um ID foi fornecido (evita erro de FK)
  if (params.conversation_id) {
    await supabase.from('conversations').upsert({
      id: params.conversation_id,
      user_id: user.id,
      title: `Analysis: ${params.endpoint.split('/').pop() || 'Search'}`
    }, { onConflict: 'id' }).select().single()
  }

  await supabase.from('api_request_history').insert({
    user_id: user.id,
    conversation_id: params.conversation_id,
    endpoint: params.endpoint,
    similarity_threshold: params.similarity_threshold,
    max_results_requested: params.max_results_requested,
    total_files_returned: params.total_files_returned,
    request_payload: params.request_payload,
    response_payload: params.response_payload,
    latency_ms: params.latency_ms,
    status: params.status,
    error_message: params.error_message
  })
}

export async function generateEmbeddingsAction(params: EmbedParams): Promise<EmbedResponse> {
  try {
    const { data } = await externalApiClient.post<EmbedResponse>('/v1/embed/', {
      text: params.text
    })
    return data
  } catch (error: any) {
    if (error.response) {
      console.error('[Action] generateEmbeddings API error:', {
        status: error.response.status,
        data: error.response.data,
        payload: { text: params.text?.substring(0, 50) + '...' }
      })
    } else {
      console.error('[Action] generateEmbeddings error:', error.message)
    }
    throw error
  }
}

export async function searchPatentsByTextAction(params: SearchByTextParams): Promise<SearchByTextResponse> {
  const start = Date.now()
  try { 
    // Removemos o conversation_id do body antes de enviar para a API externa 
    // para evitar erro 422 se a API não esperar esse campo extra
    const { conversation_id, ...apiParams } = params
    const { data } = await externalApiClient.post<SearchByTextResponse>('/v1/patents/search/by-text', apiParams)
    
    await logApiRequest({
      endpoint: '/v1/patents/search/by-text',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: data.similar_patents?.length || 0,
      request_payload: params,
      response_payload: data,
      latency_ms: Date.now() - start,
      status: 'success',
      conversation_id: params.conversation_id
    })

    return data
  } catch (error: any) {
    console.error('[Action] searchPatentsByText error:', error.response?.data || error.message)
    await logApiRequest({
      endpoint: '/v1/patents/search/by-text',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: 0,
      request_payload: params,
      response_payload: {},
      latency_ms: Date.now() - start,
      status: 'error',
      error_message: error.message,
      conversation_id: params.conversation_id
    })
    throw error
  }
}

export async function searchSimilarImagesAction(
  imageData: ArrayBuffer, 
  filename: string, 
  similarity_threshold: number, 
  max_results: number,
  conversation_id?: string
): Promise<ImagesSearchResponse> {
  const start = Date.now()
  const formData = new FormData()
  const blob = new Blob([imageData])
  formData.append('file', blob, filename)

  try {
    const { data } = await externalApiClient.post<ImagesSearchResponse>(
      '/v1/patents/images/search',
      formData,
      {
        params: {
          similarity_threshold,
          max_results,
        }
      }
    )

    await logApiRequest({
      endpoint: '/v1/patents/images/search',
      similarity_threshold,
      max_results_requested: max_results,
      total_files_returned: data.similar_images?.length || 0,
      request_payload: { filename, similarity_threshold, max_results },
      response_payload: data,
      latency_ms: Date.now() - start,
      status: 'success',
      conversation_id: conversation_id
    })

    return data
  } catch (error: any) {
    console.error('[Action] searchSimilarImages error:', error.response?.data || error.message)
    await logApiRequest({
      endpoint: '/v1/patents/images/search',
      similarity_threshold,
      max_results_requested: max_results,
      total_files_returned: 0,
      request_payload: { filename, similarity_threshold, max_results },
      response_payload: {},
      latency_ms: Date.now() - start,
      status: 'error',
      error_message: error.message,
      conversation_id: conversation_id
    })
    throw error
  }
}

export async function searchSimilarPatentsAction(params: PatentsSimilarityParams): Promise<PatentsSimilarityResponse> {
  const start = Date.now()
  try {
    const { conversation_id, text, ...apiParams } = params
    const { data } = await externalApiClient.post<PatentsSimilarityResponse>('/v1/patents/similarity', apiParams)
    
    await logApiRequest({
      endpoint: '/v1/patents/similarity',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: data.similar_patents?.length || 0,
      request_payload: params,
      response_payload: data,
      latency_ms: Date.now() - start,
      status: 'success',
      conversation_id: params.conversation_id
    })

    return data
  } catch (error: any) {
    console.error('[Action] searchSimilarPatents error:', error.response?.data || error.message)
    await logApiRequest({
      endpoint: '/v1/patents/similarity',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: 0,
      request_payload: params,
      response_payload: {},
      latency_ms: Date.now() - start,
      status: 'error',
      error_message: error.message,
      conversation_id: params.conversation_id
    })
    throw error
  }
}

export async function searchPatentsByChunksAction(params: ChunksSimilarityParams): Promise<ChunksSimilarityResponse> {
  const start = Date.now()
  try {
    const { conversation_id, text, ...apiParams } = params
    const { data } = await externalApiClient.post<ChunksSimilarityResponse>('/v1/patents/chunks/similarity', apiParams)
    
    await logApiRequest({
      endpoint: '/v1/patents/chunks/similarity',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: data.similar_patents?.length || 0,
      request_payload: params,
      response_payload: data,
      latency_ms: Date.now() - start,
      status: 'success',
      conversation_id: params.conversation_id
    })

    return data
  } catch (error: any) {
    console.error('[Action] searchPatentsByChunks error:', error.response?.data || error.message)
    await logApiRequest({
      endpoint: '/v1/patents/chunks/similarity',
      similarity_threshold: params.similarity_threshold,
      max_results_requested: params.max_results,
      total_files_returned: 0,
      request_payload: params,
      response_payload: {},
      latency_ms: Date.now() - start,
      status: 'error',
      error_message: error.message,
      conversation_id: params.conversation_id
    })
    throw error
  }
}

export async function listPatentsAction(params: ListPatentsParams): Promise<ListPatentsResponse> {
  try {
    const { data } = await externalApiClient.get<ListPatentsResponse>('/v1/patents/', {
      params
    })
    return data
  } catch (error: any) {
    console.error('[Action] listPatents error:', error.response?.data || error.message)
    throw error
  }
}

export async function searchSimilarPatentsWithTextAction(params: {
  text: string
  max_results: number
  similarity_threshold: number
  conversation_id?: string
}): Promise<PatentsSimilarityResponse> {
  try {
    const embedData = await generateEmbeddingsAction({ text: params.text })
    
    if (!embedData.embeddings || embedData.embeddings.length === 0) {
      throw new Error('Failed to generate embeddings: No embedding returned.')
    }

    const similarityResponse = await searchSimilarPatentsAction({
      embedding: embedData.embeddings[0],
      max_results: params.max_results,
      similarity_threshold: params.similarity_threshold,
      conversation_id: params.conversation_id,
      text: params.text
    })

    return similarityResponse
  } catch (error) {
    console.error('[Action] searchSimilarPatentsWithText error:', error)
    throw error
  }
}

export async function searchPatentsByChunksWithTextAction(params: {
  text: string
  max_results: number
  similarity_threshold: number
  conversation_id?: string
}): Promise<ChunksSimilarityResponse> {
  try {
    const embedData = await generateEmbeddingsAction({ text: params.text })
    
    if (!embedData.embeddings || embedData.embeddings.length === 0) {
      throw new Error('Failed to generate embeddings: No embedding returned.')
    }

    const chunksResponse = await searchPatentsByChunksAction({
      embedding: embedData.embeddings[0],
      max_results: params.max_results,
      similarity_threshold: params.similarity_threshold,
      conversation_id: params.conversation_id,
      text: params.text
    })

    return chunksResponse
  } catch (error) {
    console.error('[Action] searchPatentsByChunksWithText error:', error)
    throw error
  }
}

export async function getPatentImagesAction(publicationNumber: string): Promise<PatentImagesResponse> {
  try {
    const { data } = await externalApiClient.get<PatentImagesResponse>(`/v1/patents/${publicationNumber}/images`)
    return data
  } catch (error: any) {
    console.error(`[Action] getPatentImages error for ${publicationNumber}:`, error.response?.data || error.message)
    throw error
  }
}

export async function getPatentImageBinaryAction(imagePath: string): Promise<string> {
  try {
    const { data } = await externalApiClient.get(`/v1/patents/images/${imagePath}`, {
      responseType: 'arraybuffer'
    })
    
    // Converter o arraybuffer para base64 para retornar ao cliente
    const base64 = Buffer.from(data).toString('base64')
    const contentType = 'image/png' // A API converte TIFF para PNG automaticamente
    return `data:${contentType};base64,${base64}`
  } catch (error: any) {
    console.error(`[Action] getPatentImageBinary error for ${imagePath}:`, error.response?.data || error.message)
    throw error
  }
}
