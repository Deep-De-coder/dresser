export interface WardrobeItem {
  id: string
  name: string
  category: string
  imageUrl: string
  color: string
  season: string[]
  favorite: boolean
  confidence?: number
  uploadedAt?: Date
}

export interface UploadedItem {
  id: string
  name: string
  category: string
  imageUrl: string
  confidence: number
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

export interface Outfit {
  id: string
  name: string
  items: WardrobeItem[]
  season: string[]
  occasion: string
  favorite: boolean
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
  }
}
