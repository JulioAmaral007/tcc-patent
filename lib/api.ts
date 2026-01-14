import type { 
  SearchByTextResponse, 
  ImagesSearchResponse,
  EmbedParams,
  EmbedResponse,
  SearchByTextParams,
  ImagesSearchParams,
  PatentsSimilarityParams,
  PatentsSimilarityResponse,
  ChunksSimilarityParams,
  ChunksSimilarityResponse
} from './types'

import { 
  searchPatentsByTextAction, 
  searchSimilarImagesAction,
  searchSimilarPatentsWithTextAction
} from '@/app/_actions/patent-actions'

// API integration for patent analysis
const API_URL = '/api/analyze' 

// ========================================
// Types for Frontend Analysis
// ========================================
export interface AnalyzeRequest {
  text: string
}

export interface AnalyzeResponse {
  result: string
  success: boolean
  error?: string
}

// ========================================
// API Calls (Using Server Actions)
// ========================================

/**
 * Realiza análise inteligente de uma patente (Mock por enquanto)
 */
export async function analyzePatent(text: string): Promise<AnalyzeResponse> {
  if (!text || text.trim().length === 0) {
    return { result: '', success: false, error: 'O texto da patente está vazio.' }
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResult = `
═══════════════════════════════════════════════════════════════
                    ANÁLISE DE PATENTE
═══════════════════════════════════════════════════════════════

📋 RESUMO DA ANÁLISE
─────────────────────────────────────────────────────────────

Texto analisado com sucesso.
Total de caracteres processados: ${text.length.toLocaleString()}

📝 CONTEÚDO EXTRAÍDO
─────────────────────────────────────────────────────────────

${text.substring(0, 500)}${text.length > 500 ? '...' : ''}

📊 ESTATÍSTICAS
─────────────────────────────────────────────────────────────

• Palavras: ${text.split(/\s+/).filter(Boolean).length.toLocaleString()}
• Caracteres: ${text.length.toLocaleString()}
• Parágrafos: ${text.split(/\n\n+/).filter(Boolean).length}

═══════════════════════════════════════════════════════════════
                    FIM DA ANÁLISE
═══════════════════════════════════════════════════════════════

⚠️ NOTA: Esta é uma resposta de demonstração.
   Conecte sua API real para obter análises completas.
`.trim()

    return { result: mockResult, success: true }
  } catch (error) {
    console.error('API Error:', error)
    return {
      result: '',
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao conectar com a API.',
    }
  }
}

/**
 * Realiza busca por similaridade de texto usando Server Action
 */
export async function performTextSearch(options: {
  text: string
  similarity_threshold: number
  max_results: number
  use_chunks: boolean
}): Promise<SearchByTextResponse> {
  return searchPatentsByTextAction(options)
}

/**
 * Realiza busca por similaridade usando o fluxo: Embed -> Search Similarity
 */
export async function performSimilaritySearchByText(options: {
  text: string
  similarity_threshold: number
  max_results: number
}): Promise<PatentsSimilarityResponse> {
  return searchSimilarPatentsWithTextAction(options)
}

/**
 * Realiza busca por similaridade de imagem usando Server Action
 */
export async function performImageSearch(options: {
  file: File
  similarity_threshold: number
  max_results: number
}): Promise<ImagesSearchResponse> {
  // Convertemos o File para ArrayBuffer antes de enviar para a Server Action
  const arrayBuffer = await options.file.arrayBuffer()
  
  return searchSimilarImagesAction(
    arrayBuffer,
    options.file.name,
    options.similarity_threshold,
    options.max_results
  )
}

// ========================================
// Result Formatters
// ========================================

export function formatSimilarityResults(response: SearchByTextResponse): string {
  let result = `
═══════════════════════════════════════════════════════════════
                  BUSCA POR SIMILARIDADE DE TEXTO
═══════════════════════════════════════════════════════════════

📊 RESUMO DA BUSCA
─────────────────────────────────────────────────────────────
• Total de patentes encontradas: ${response.total_found}
• Limite de similaridade: ${(response.similarity_threshold * 100).toFixed(0)}%
• Dimensão do embedding: ${response.query_embedding_dimension}

📋 PATENTES SIMILARES
─────────────────────────────────────────────────────────────

`

  response.similar_patents.forEach((patent, index) => {
    result += `
${index + 1}. ${patent.title || 'Sem título'}
   ├─ Nº Publicação: ${patent.publication_number || 'N/A'}
   ├─ Data: ${patent.publication_date || 'N/A'}
   ├─ Similaridade: ${(patent.similarity_score * 100).toFixed(1)}%
   ├─ Organização: ${patent.orgname || 'N/A'}
   ├─ Códigos IPC: ${patent.ipc_codes?.join(', ') || 'N/A'}
   └─ Resumo: ${patent.abstract?.substring(0, 200) || 'N/A'}${patent.abstract && patent.abstract.length > 200 ? '...' : ''}

`
  })

  result += `
═══════════════════════════════════════════════════════════════
                      FIM DA BUSCA
═══════════════════════════════════════════════════════════════
`
  return result.trim()
}

export function formatImageSimilarityResults(response: ImagesSearchResponse): string {
  let result = `
═══════════════════════════════════════════════════════════════
                 BUSCA POR SIMILARIDADE DE IMAGEM
═══════════════════════════════════════════════════════════════

📊 RESUMO DA BUSCA
─────────────────────────────────────────────────────────────
• Total de imagens encontradas: ${response.total_found}
• Limite de similaridade: ${(response.similarity_threshold * 100).toFixed(0)}%
• Dimensão do embedding: ${response.query_embedding_dimension}

🖼️ IMAGENS SIMILARES
─────────────────────────────────────────────────────────────

`

  response.similar_images.forEach((image, index) => {
    result += `
${index + 1}. ${image.title || 'Sem título'}
   ├─ ID da Imagem: ${image.image_id}
   ├─ Nº Publicação: ${image.publication_number || 'N/A'}
   ├─ Arquivo: ${image.image_filename || 'N/A'}
   ├─ Similaridade: ${(image.similarity_score * 100).toFixed(1)}%
   ├─ Data: ${image.publication_date || 'N/A'}
   ├─ Organização: ${image.orgname || 'N/A'}
   └─ Resumo: ${image.abstract?.substring(0, 200) || 'N/A'}${image.abstract && image.abstract.length > 200 ? '...' : ''}

`
  })

  result += `
═══════════════════════════════════════════════════════════════
                      FIM DA BUSCA
═══════════════════════════════════════════════════════════════
`
  return result.trim()
}
