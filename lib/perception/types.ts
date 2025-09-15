export interface ImageAnalysis {
  colors: string[]
  patterns: string[]
  fabric: string
  category: string
  formality: 'casual' | 'business' | 'formal' | 'sport' | 'party' | 'outdoor'
  confidence: number
  embedding?: number[]
  perceptualHash?: string
}

export interface DuplicateDetection {
  isDuplicate: boolean
  similarItems: Array<{
    id: string
    similarity: number
    perceptualHash: string
  }>
  confidence: number
}

export interface PerceptionConfig {
  enableClientSide: boolean
  enableServerSide: boolean
  embeddingModel: string
  similarityThreshold: number
  maxFileSize: number
}

export interface ClientSideCapabilities {
  hasCLIP: boolean
  hasImageProcessing: boolean
  hasLocalStorage: boolean
}
