import type { 
  SearchByTextResponse, 
  ImagesSearchResponse,
  PatentsSimilarityResponse,
  ChunksSimilarityResponse,
  EmbedResponse,
} from './types'

import { 
  searchSimilarImagesAction
} from '@/app/_actions/patent-actions'

// API integration for patent analysis

// ========================================
// API Calls (Using Server Actions)
// ========================================


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
• Limite de similaridade (Threshold): ${(response.similarity_threshold * 100).toFixed(0)}%
• Resultados solicitados (Max): ${response.max_results}
• Dimensão do embedding: ${response.query_embedding_dimension}

📋 PATENTES SIMILARES
─────────────────────────────────────────────────────────────

`

  response.similar_patents.forEach((patent, index) => {
    result += `
${index + 1}. ${patent.title || 'Sem título'}
   ├─ Nº Publicação: ${patent.publication_number || 'N/A'}
   ├─ Nº Depósito: ${patent.application_number || 'N/A'}
   ├─ Data: ${patent.publication_date || 'N/A'}
   ├─ Similaridade: ${(patent.similarity_score * 100).toFixed(1)}%
   ├─ Organização: ${patent.orgname || 'N/A'}
   ├─ Códigos IPC: ${patent.ipc_codes?.join(', ') || 'N/A'}
   └─ Resumo: ${patent.abstract || 'N/A'}

`
  })

  result += `
═══════════════════════════════════════════════════════════════
                      FIM DA BUSCA
═══════════════════════════════════════════════════════════════
`
  return result.trim()
}

export function formatChunksSimilarityResults(response: ChunksSimilarityResponse): string {
  let result = `
═══════════════════════════════════════════════════════════════
                  BUSCA POR TRECHOS (CHUNKS)
═══════════════════════════════════════════════════════════════

📊 RESUMO DA BUSCA
─────────────────────────────────────────────────────────────
• Total de trechos encontrados: ${response.total_found}
• Limite de similaridade: ${(response.similarity_threshold * 100).toFixed(0)}%
• Dimensão do embedding: ${response.query_embedding_dimension}

📋 TRECHOS SIMILARES
─────────────────────────────────────────────────────────────

`

  response.similar_patents.forEach((patent, index) => {
    result += `
${index + 1}. ${patent.title || 'Sem título'}
   ├─ Nº Publicação: ${patent.publication_number || 'N/A'}
   ├─ Similaridade: ${(patent.similarity_score * 100).toFixed(1)}%
   ├─ Organização: ${patent.orgname || 'N/A'}
   └─ Trechos Relacionados:
`
    patent.chunks?.forEach((chunk: string, cIdx: number) => {
      result += `      ${cIdx + 1}. "${chunk.substring(0, 150)}${chunk.length > 150 ? '...' : ''}"\n`
    })
    result += '\n'
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
   └─ Resumo: ${image.abstract || 'N/A'}

`
  })

  result += `
═══════════════════════════════════════════════════════════════
                      FIM DA BUSCA
═══════════════════════════════════════════════════════════════
`
  return result.trim()
}
