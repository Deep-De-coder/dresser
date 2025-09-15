export interface Item {
  id: string
  userId: string
  title: string
  category: string
  colors: string[]
  patterns: string[]
  fabric: string
  seasons: string[]
  formality: 'casual' | 'business' | 'formal' | 'sport' | 'party' | 'outdoor'
  imageUrl: string
  wearCount: number
  isClean: boolean
  createdAt: Date
  embedding?: number[]
}

export interface Outfit {
  id: string
  userId: string
  itemIds: string[]
  context: {
    occasion: string
    date: string
    city: string
    weather: WeatherData
  }
  rationale: string
  score: number
  createdAt: Date
}

export interface Preferences {
  userId: string
  style: {
    preferredColors: string[]
    avoidedColors: string[]
    preferredSilhouettes: string[]
    comfortConstraints: string[]
    formalityPreference: 'casual' | 'business' | 'formal' | 'mixed'
  }
  constraints: {
    budget: number
    climate: string
    lifestyle: string[]
  }
}

export interface Feedback {
  id: string
  userId: string
  outfitId?: string
  decision: 'accepted' | 'rejected'
  reason: string
  createdAt: Date
}

export interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  precipitation: number
}

export interface DatabaseConfig {
  url?: string
  vectorDbOpts?: {
    dimension: number
    indexType: string
  }
  fallbackMode: boolean
}

export interface QueryFilters {
  category?: string
  colors?: string[]
  seasons?: string[]
  formality?: string
  isClean?: boolean
  userId: string
}

export interface SimilarityQuery {
  embedding: number[]
  threshold: number
  limit: number
}
