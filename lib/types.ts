// Types for Patent API

// ========================================
// Route: /embed/
// ========================================
export interface EmbedParams {
  text: string
}

export interface EmbedResponse {
  chunks: string[]
  embeddings: number[][]
}

// ========================================
// Route: /patents/similarity
// ========================================
export interface PatentsSimilarityParams {
  embedding: number[]
  max_results: number
  similarity_threshold: number
  conversation_id?: string
  text?: string // Added for logging purposes
}

export interface SimilarPatent {
  publication_number: string | null
  publication_date: string | null
  publication_year: number | null
  application_number: string | null
  title: string
  abstract: string
  description: string
  ipc_codes: string[]
  orgname: string | null
  maingroup: string | null
  subgroup: string | null
  similarity_score: number
  created_at: string | null
  updated_at: string | null
}

export interface PatentsSimilarityResponse {
  similar_patents: SimilarPatent[]
  total_found: number
  query_embedding_dimension: number
  similarity_threshold: number
  max_results: number
}

// ========================================
// Route: /patents/search/by-text
// ========================================
export interface SearchByTextParams {
  text: string
  similarity_threshold: number
  max_results: number
  use_chunks: boolean
  conversation_id?: string
}

export type SearchByTextResponse = PatentsSimilarityResponse

// ========================================
// Route: /patents/images/search
// ========================================
export interface ImagesSearchParams {
  file: File
  similarity_threshold: number
  max_results: number
}

export interface SimilarImage {
  image_id: number
  publication_number: string | null
  image_path: string | null
  image_filename: string | null
  title: string
  abstract: string
  description: string
  publication_date: string | null
  publication_year: number | null
  application_number: string | null
  ipc_codes: string[]
  orgname: string | null
  maingroup: string | null
  subgroup: string | null
  similarity_score: number
}

export interface ImagesSearchResponse {
  similar_images: SimilarImage[]
  total_found: number
  query_embedding_dimension: number
  similarity_threshold: number
  max_results: number
}

// ========================================
// Route: /patents/chunks/similarity
// ========================================
export interface ChunksSimilarityParams {
  embedding: number[]
  max_results: number
  similarity_threshold: number
  conversation_id?: string
  text?: string // Added for logging purposes
}

export interface SimilarPatentByChunks {
  publication_number: string | null
  publication_date: string | null
  publication_year: number | null
  application_number: string | null
  title: string
  abstract: string
  description: string
  ipc_codes: string[]
  orgname: string | null
  maingroup: string | null
  subgroup: string | null
  chunks: string[]
  similarity_score: number
  created_at: string | null
  updated_at: string | null
}

export interface ChunksSimilarityResponse {
  similar_patents: SimilarPatentByChunks[]
  total_found: number
  query_embedding_dimension: number
  similarity_threshold: number
  max_results: number
}

// ========================================
// Route: /patents/
// ========================================
export interface ListPatentsParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface Patent {
  publication_number: string
  publication_date: string
  publication_year: number
  application_number: string
  title: string
  abstract: string
  description: string
  ipc_codes: string[]
  orgname: string
  maingroup: string
  subgroup: string
  embedding: number[]
  has_embedding: boolean
  created_at: string
  updated_at: string
}

export interface ListPatentsResponse {
  patents: Patent[]
  total_count: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

// ========================================
// Route: /patents/{publication_number}/images
// ========================================
export interface PatentImage {
  id: number
  publication_number: string
  image_path: string
  image_filename: string
  image_url: string
  description: string
  created_at: string
}

export interface PatentImagesResponse {
  publication_number: string
  images: PatentImage[]
  total_count: number
}

// ========================================
// Shared Slider Configuration
// ========================================
export interface SliderConfig {
  id: string
  label: string
  description: string
  min: number
  max: number
  step: number
  defaultValue: number
}

// Default values from API documentation
export const API_DEFAULTS = {
  similarity_threshold: 0.5,
  max_results: 10,
} as const

// Slider configurations for each parameter
export const SLIDER_CONFIGS: Record<string, SliderConfig> = {
  similarity_threshold: {
    id: 'similarity_threshold',
    label: 'Similarity Threshold',
    description: 'Defines the minimum similarity threshold (0-1). Higher values return more relevant results.',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.5,
  },
  max_results: {
    id: 'max_results',
    label: 'Maximum Results',
    description: 'Maximum number of patents returned by the search (1-100).',
    min: 1,
    max: 100,
    step: 1,
    defaultValue: 10,
  },
}
