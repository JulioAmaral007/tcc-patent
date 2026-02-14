import type {
  SearchByTextResponse,
  ImagesSearchResponse,
  ChunksSimilarityResponse,
} from './types'

/**
 * Result formatters for export (PDF and clipboard).
 * UI rendering uses structured data directly; these formatters
 * are only used to generate text for PDF and copy.
 */

export function formatSimilarityResults(
  response: SearchByTextResponse,
): string {
  let result = `
═══════════════════════════════════════════════════════════════
                  TEXT SIMILARITY SEARCH
═══════════════════════════════════════════════════════════════

📊 SEARCH SUMMARY
─────────────────────────────────────────────────────────────
• Total patents found: ${response.total_found}
• Similarity Threshold: ${(response.similarity_threshold * 100).toFixed(0)}%
• Requested results (Max): ${response.max_results}
• Embedding dimension: ${response.query_embedding_dimension}

📋 SIMILAR PATENTS
─────────────────────────────────────────────────────────────

`

  response.similar_patents.forEach((patent, index) => {
    result += `${index + 1}. ${patent.title || 'No title'}
├── Publication No.: ${patent.publication_number || 'N/A'}
├── Application No.: ${patent.application_number || 'N/A'}
├── Date: ${patent.publication_date || 'N/A'}
├── Similarity: ${(patent.similarity_score * 100).toFixed(1)}%
├── Organization: ${patent.orgname || 'N/A'}
├── IPC Codes: ${patent.ipc_codes?.join(', ') || 'N/A'}
└── Abstract: ${patent.abstract || 'N/A'}

`
  })

  return result.trim()
}

export function formatChunksSimilarityResults(
  response: ChunksSimilarityResponse,
): string {
  let result = `
═══════════════════════════════════════════════════════════════
                  CHUNK SEARCH
═══════════════════════════════════════════════════════════════

📊 SEARCH SUMMARY
─────────────────────────────────────────────────────────────
• Total chunks found: ${response.total_found}
• Similarity Threshold: ${(response.similarity_threshold * 100).toFixed(0)}%
• Embedding dimension: ${response.query_embedding_dimension}

📋 SIMILAR CHUNKS
─────────────────────────────────────────────────────────────

`

  response.similar_patents.forEach((patent, index) => {
    result += `${index + 1}. ${patent.title || 'No title'}
├── Publication No.: ${patent.publication_number || 'N/A'}
├── Similarity: ${(patent.similarity_score * 100).toFixed(1)}%
├── Organization: ${patent.orgname || 'N/A'}
└── Related Chunks:
`
    patent.chunks?.forEach((chunk: string, cIdx: number) => {
      const char =
        patent.chunks && cIdx === patent.chunks.length - 1 ? '   └──' : '   ├──'
      result += `${char} ${cIdx + 1}. "${chunk.substring(0, 150)}${chunk.length > 150 ? '...' : ''}"\n`
    })
    result += '\n'
  })

  return result.trim()
}

export function formatImageSimilarityResults(
  response: ImagesSearchResponse,
): string {
  let result = `
═══════════════════════════════════════════════════════════════
                 IMAGE SIMILARITY SEARCH
═══════════════════════════════════════════════════════════════

📊 SEARCH SUMMARY
─────────────────────────────────────────────────────────────
• Total images found: ${response.total_found}
• Similarity Threshold: ${(response.similarity_threshold * 100).toFixed(0)}%
• Embedding dimension: ${response.query_embedding_dimension}

🖼️ SIMILAR IMAGES
─────────────────────────────────────────────────────────────

`

  response.similar_images.forEach((image, index) => {
    result += `${index + 1}. ${image.title || 'No title'}
├── Image ID: ${image.image_id}
├── Publication No.: ${image.publication_number || 'N/A'}
├── File: ${image.image_filename || 'N/A'}
├── Similarity: ${(image.similarity_score * 100).toFixed(1)}%
├── Date: ${image.publication_date || 'N/A'}
├── Organization: ${image.orgname || 'N/A'}
└── Abstract: ${image.abstract || 'N/A'}

`
  })

  return result.trim()
}
