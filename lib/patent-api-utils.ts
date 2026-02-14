import axios from 'axios'

/**
 * Patent External API Client (Axios Instance)
 * Server-side only - Centraliza chamadas para a API externa de patentes
 */

const API_BASE_URL = process.env.PATENT_API_URL
const API_TOKEN = process.env.PATENT_API_TOKEN

// Cria uma instância do Axios pré-configurada
export const externalApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
})
