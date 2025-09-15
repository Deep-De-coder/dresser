import { DatabaseAdapter, Item, Outfit, Preferences, Feedback, QueryFilters, SimilarityQuery } from './interface'
import { WeatherData } from './types'

export class LocalFallbackAdapter implements DatabaseAdapter {
  private items: Map<string, Item> = new Map()
  private outfits: Map<string, Outfit> = new Map()
  private preferences: Map<string, Preferences> = new Map()
  private feedback: Map<string, Feedback> = new Map()

  async createItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
    const newItem: Item = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    this.items.set(newItem.id, newItem)
    return newItem
  }

  async getItem(id: string): Promise<Item | null> {
    return this.items.get(id) || null
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const item = this.items.get(id)
    if (!item) throw new Error('Item not found')
    
    const updatedItem = { ...item, ...updates }
    this.items.set(id, updatedItem)
    return updatedItem
  }

  async deleteItem(id: string): Promise<void> {
    this.items.delete(id)
  }

  async searchItems(filters: QueryFilters): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => {
      if (item.userId !== filters.userId) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.colors && !filters.colors.some(color => item.colors.includes(color))) return false
      if (filters.seasons && !filters.seasons.some(season => item.seasons.includes(season))) return false
      if (filters.formality && item.formality !== filters.formality) return false
      if (filters.isClean !== undefined && item.isClean !== filters.isClean) return false
      return true
    })
  }

  async findSimilarItems(query: SimilarityQuery): Promise<Item[]> {
    // Simple fallback: return random items if no embedding similarity
    const items = Array.from(this.items.values())
    return items.slice(0, query.limit)
  }

  async createOutfit(outfit: Omit<Outfit, 'id' | 'createdAt'>): Promise<Outfit> {
    const newOutfit: Outfit = {
      ...outfit,
      id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    this.outfits.set(newOutfit.id, newOutfit)
    return newOutfit
  }

  async getOutfit(id: string): Promise<Outfit | null> {
    return this.outfits.get(id) || null
  }

  async getUserOutfits(userId: string, limit = 50): Promise<Outfit[]> {
    return Array.from(this.outfits.values())
      .filter(outfit => outfit.userId === userId)
      .slice(0, limit)
  }

  async getPreferences(userId: string): Promise<Preferences | null> {
    return this.preferences.get(userId) || null
  }

  async updatePreferences(userId: string, preferences: Partial<Preferences>): Promise<Preferences> {
    const existing = this.preferences.get(userId) || {
      userId,
      style: {
        preferredColors: [],
        avoidedColors: [],
        preferredSilhouettes: [],
        comfortConstraints: [],
        formalityPreference: 'casual'
      },
      constraints: {
        budget: 0,
        climate: '',
        lifestyle: []
      }
    }
    
    const updated = { ...existing, ...preferences }
    this.preferences.set(userId, updated)
    return updated
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    this.feedback.set(newFeedback.id, newFeedback)
    return newFeedback
  }

  async getFeedbackByOutfit(outfitId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter(f => f.outfitId === outfitId)
  }

  async getUserFeedback(userId: string, limit = 50): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter(f => f.userId === userId)
      .slice(0, limit)
  }

  async getWearFrequency(userId: string, days = 30): Promise<{ itemId: string; count: number }[]> {
    return Array.from(this.items.values())
      .filter(item => item.userId === userId)
      .map(item => ({ itemId: item.id, count: item.wearCount }))
      .sort((a, b) => b.count - a.count)
  }

  async getMostUsedColors(userId: string): Promise<{ color: string; count: number }[]> {
    const colorCounts = new Map<string, number>()
    
    Array.from(this.items.values())
      .filter(item => item.userId === userId)
      .forEach(item => {
        item.colors.forEach(color => {
          colorCounts.set(color, (colorCounts.get(color) || 0) + item.wearCount)
        })
      })
    
    return Array.from(colorCounts.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count)
  }

  async isConnected(): Promise<boolean> {
    return true // Local fallback is always "connected"
  }

  async migrate(): Promise<void> {
    // No migration needed for local fallback
  }
}
