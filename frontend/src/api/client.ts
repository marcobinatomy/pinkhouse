import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Quotes API
export const quotesApi = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/quotes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  list: async (status?: string) => {
    const params = status ? { status } : {}
    return api.get('/quotes/', { params })
  },
  
  get: async (id: number) => {
    return api.get(`/quotes/${id}`)
  },
  
  delete: async (id: number) => {
    return api.delete(`/quotes/${id}`)
  },
  
  reprocess: async (id: number) => {
    return api.post(`/quotes/${id}/reprocess`)
  },
  
  updateItem: async (quoteId: number, itemIndex: number, updates: Record<string, unknown>) => {
    return api.patch(`/quotes/${quoteId}/items/${itemIndex}`, updates)
  },
}

// Search API
export const searchApi = {
  search: async (query: string, barcode?: string, sources?: string[]) => {
    return api.post('/search/', {
      query,
      barcode,
      sources: sources || ['amazon', 'eprice', 'trovaprezzi'],
      max_results: 10,
    })
  },
  
  quickSearch: async (query: string, barcode?: string) => {
    const params = new URLSearchParams({ q: query })
    if (barcode) params.append('barcode', barcode)
    return api.get(`/search/quick?${params}`)
  },
  
  searchQuote: async (quoteId: number, sources?: string[]) => {
    return api.post(`/search/quote/${quoteId}`, null, {
      params: sources ? { sources: sources.join(',') } : {},
    })
  },
  
  getSources: async () => {
    return api.get('/search/sources')
  },
}

// Reports API
export const reportsApi = {
  generate: async (quoteId: number, reportType = 'comparison') => {
    return api.post('/reports/generate', {
      quote_id: quoteId,
      report_type: reportType,
      include_charts: true,
    })
  },
  
  get: async (id: number) => {
    return api.get(`/reports/${id}`)
  },
  
  list: async (quoteId?: number) => {
    const params = quoteId ? { quote_id: quoteId } : {}
    return api.get('/reports/', { params })
  },
  
  analyzeImage: async (imageBase64: string) => {
    return api.post('/reports/analyze-image', { image_base64: imageBase64 })
  },
  
  extractText: async (text: string, type = 'invoice') => {
    return api.post('/reports/extract-text', { text, extraction_type: type })
  },
}

// Health check
export const healthApi = {
  check: async () => {
    return axios.get(`${API_BASE_URL}/health`)
  },
}
