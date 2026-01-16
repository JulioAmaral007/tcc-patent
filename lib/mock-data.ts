import type { 
  EmbedResponse, 
  PatentsSimilarityResponse, 
  ImagesSearchResponse,
  ChunksSimilarityResponse,
  SimilarPatent,
} from './types'

export const MOCK_EMBED_RESPONSE: EmbedResponse = {
  chunks: ["Exemplo de chunk 1", "Exemplo de chunk 2"],
  embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
}

const MOCK_PATENTS: SimilarPatent[] = [
  {
    publication_number: "BR123456789",
    publication_date: "2023-01-01",
    publication_year: 2023,
    application_number: "BR102023000001",
    title: "Sistema de Inteligência Artificial para Análise de Patentes",
    abstract: "A presente invenção descreve um sistema e método para análise automatizada de documentos de patentes utilizando processamento de linguagem natural.",
    description: "Descrição detalhada do sistema de IA...",
    ipc_codes: ["G06F 17/00", "G06N 3/00"],
    orgname: "Universidade Mock",
    maingroup: "G06F",
    subgroup: "17/00",
    similarity_score: 0.95,
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z"
  },
  {
    publication_number: "US987654321",
    publication_date: "2022-05-15",
    publication_year: 2022,
    application_number: "US17/123456",
    title: "Blockchain-based Patent Management",
    abstract: "A system for managing patent lifecycles using distributed ledger technology to ensure transparency and security.",
    description: "Detailed description of the blockchain implementation...",
    ipc_codes: ["H04L 9/32", "G06F 21/00"],
    orgname: "Mock Tech Corp",
    maingroup: "H04L",
    subgroup: "9/32",
    similarity_score: 0.88,
    created_at: "2022-05-15T10:00:00Z",
    updated_at: "2022-05-15T10:00:00Z"
  }
]

export const MOCK_SIMILARITY_RESPONSE: PatentsSimilarityResponse = {
  similar_patents: MOCK_PATENTS,
  total_found: 2,
  query_embedding_dimension: 1536,
  similarity_threshold: 0.5,
  max_results: 10
}

export const MOCK_IMAGES_RESPONSE: ImagesSearchResponse = {
  similar_images: [
    {
      image_id: 1,
      publication_number: "BR123456789",
      image_path: "https://placehold.co/400x300?text=Patent+Image+1",
      image_filename: "figura1.png",
      title: "Diagrama do Sistema",
      abstract: "Abstract da patente da imagem 1",
      description: "Descrição da imagem 1",
      publication_date: "2023-01-01",
      publication_year: 2023,
      application_number: "BR102023000001",
      ipc_codes: ["G06F"],
      orgname: "Universidade Mock",
      maingroup: "G06F",
      subgroup: "17/00",
      similarity_score: 0.92
    }
  ],
  total_found: 1,
  query_embedding_dimension: 512,
  similarity_threshold: 0.5,
  max_results: 10
}

export const MOCK_CHUNKS_RESPONSE: ChunksSimilarityResponse = {
  similar_patents: MOCK_PATENTS.map(p => ({
    ...p,
    chunks: ["Excerto relevante 1", "Excerto relevante 2"]
  })),
  total_found: 2,
  query_embedding_dimension: 1536,
  similarity_threshold: 0.5,
  max_results: 10
}
