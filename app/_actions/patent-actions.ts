'use server'

import { externalApiClient } from '@/lib/patent-api-utils'
import { 
  SearchByTextParams, 
  SearchByTextResponse, 
  ImagesSearchParams, 
  ImagesSearchResponse,
  EmbedParams,
  EmbedResponse,
  PatentsSimilarityParams,
  PatentsSimilarityResponse,
  ChunksSimilarityParams,
  ChunksSimilarityResponse
} from '@/lib/types'
import {
  MOCK_EMBED_RESPONSE,
  MOCK_SIMILARITY_RESPONSE,
  MOCK_IMAGES_RESPONSE,
  MOCK_CHUNKS_RESPONSE
} from '@/lib/mock-data'

/**
 * Server Actions para comunicação segura com a API externa de patentes.
 * Estas funções rodam apenas no servidor, mantendo o PATENT_API_TOKEN protegido.
 */

// Toggle para usar mocks em vez da API real
const USE_MOCKS = true 

export async function generateEmbeddingsAction(params: EmbedParams): Promise<EmbedResponse> {
  if (USE_MOCKS) {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    return MOCK_EMBED_RESPONSE
  }

  try {
    const { data } = await externalApiClient.post<EmbedResponse>('/embed/', {
      text: params.text
    })
    return data
  } catch (error) {
    console.error('[Action] generateEmbeddings error:', error)
    throw error
  }
}

export async function searchPatentsByTextAction(params: SearchByTextParams): Promise<SearchByTextResponse> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_SIMILARITY_RESPONSE
  }

  try {
    const { data } = await externalApiClient.post<SearchByTextResponse>('/patents/search/by-text', params)
    return data
  } catch (error) {
    console.error('[Action] searchPatentsByText error:', error)
    throw error
  }
}

export async function searchSimilarImagesAction(
  imageData: ArrayBuffer, 
  filename: string, 
  similarity_threshold: number, 
  max_results: number
): Promise<ImagesSearchResponse> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return MOCK_IMAGES_RESPONSE
  }

  try {
    const formData = new FormData()
    const blob = new Blob([imageData])
    formData.append('file', blob, filename)

    const { data } = await externalApiClient.post<ImagesSearchResponse>(
      '/patents/images/search',
      formData,
      {
        params: {
          similarity_threshold,
          max_results,
        }
      }
    )
    return data
  } catch (error) {
    console.error('[Action] searchSimilarImages error:', error)
    throw error
  }
}

export async function searchSimilarPatentsAction(params: PatentsSimilarityParams): Promise<PatentsSimilarityResponse> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_SIMILARITY_RESPONSE
  }

  try {
    const { data } = await externalApiClient.post<PatentsSimilarityResponse>('/patents/similarity', params)
    return data
  } catch (error) {
    console.error('[Action] searchSimilarPatents error:', error)
    throw error
  }
}

export async function searchPatentsByChunksAction(params: ChunksSimilarityParams): Promise<ChunksSimilarityResponse> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_CHUNKS_RESPONSE
  }

  try {
    const { data } = await externalApiClient.post<ChunksSimilarityResponse>('/patents/chunks/similarity', params)
    return data
  } catch (error) {
    console.error('[Action] searchPatentsByChunks error:', error)
    throw error
  }
}

/**
 * Orquestra a geração de embeddings e a busca por similaridade em uma única ação.
 */
export async function searchSimilarPatentsWithTextAction(params: {
  text: string
  max_results: number
  similarity_threshold: number
}): Promise<PatentsSimilarityResponse> {
  try {
    // 1. Gera o embedding para o texto fornecido
    const embedData = await generateEmbeddingsAction({ text: params.text })
    
    if (!embedData.embeddings || embedData.embeddings.length === 0) {
      throw new Error('Falha ao gerar embeddings: Nenhum embedding retornado.')
    }

    // 2. Usa o primeiro embedding para buscar patentes similares
    // (O endpoint /embed retorna uma lista de embeddings, pegamos o primeiro)
    const similarityResponse = await searchSimilarPatentsAction({
      embedding: embedData.embeddings[0],
      max_results: params.max_results,
      similarity_threshold: params.similarity_threshold
    })

    return similarityResponse
  } catch (error) {
    console.error('[Action] searchSimilarPatentsWithText error:', error)
    throw error
  }
}
