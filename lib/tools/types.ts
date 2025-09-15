export interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  precipitation: number
  timestamp: Date
}

export interface WardrobeSearchFilters {
  category?: string
  colors?: string[]
  seasons?: string[]
  formality?: string
  isClean?: boolean
  maxWearCount?: number
  embeddingQuery?: number[]
}

export interface WardrobeSearchResult {
  items: Array<{
    id: string
    title: string
    category: string
    colors: string[]
    formality: string
    isClean: boolean
    wearCount: number
    similarity?: number
  }>
  totalCount: number
  filters: WardrobeSearchFilters
}

export interface LaundryStatus {
  itemId: string
  isClean: boolean
  lastWorn?: Date
  wearCount: number
}

export interface OutfitScore {
  score: number
  rationale: string
  breakdown: {
    weather: number
    formality: number
    colorHarmony: number
    seasonality: number
    wearFrequency: number
  }
  suggestions: string[]
}

export interface GapAnalysis {
  category: string
  priority: 'high' | 'medium' | 'low'
  description: string
  suggestedSpecs: {
    colors: string[]
    formality: string
    seasons: string[]
    fabric?: string
  }
  reasoning: string
}

export interface ToolResult<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    executionTime: number
    toolName: string
    timestamp: Date
  }
}
