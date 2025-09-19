import { Item, Outfit, Preferences, Feedback, QueryFilters, SimilarityQuery } from './types'

export type { Item, Outfit, Preferences, Feedback, QueryFilters, SimilarityQuery }

export interface DatabaseAdapter {
  // Items
  createItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item>
  getItem(id: string): Promise<Item | null>
  updateItem(id: string, updates: Partial<Item>): Promise<Item>
  deleteItem(id: string): Promise<void>
  searchItems(filters: QueryFilters): Promise<Item[]>
  findSimilarItems(query: SimilarityQuery): Promise<Item[]>
  
  // Outfits
  createOutfit(outfit: Omit<Outfit, 'id' | 'createdAt'>): Promise<Outfit>
  getOutfit(id: string): Promise<Outfit | null>
  getUserOutfits(userId: string, limit?: number): Promise<Outfit[]>
  
  // Preferences
  getPreferences(userId: string): Promise<Preferences | null>
  updatePreferences(userId: string, preferences: Partial<Preferences>): Promise<Preferences>
  
  // Feedback
  createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>
  getFeedbackByOutfit(outfitId: string): Promise<Feedback[]>
  getUserFeedback(userId: string, limit?: number): Promise<Feedback[]>
  
  // Analytics
  getWearFrequency(userId: string, days?: number): Promise<{ itemId: string; count: number }[]>
  getMostUsedColors(userId: string): Promise<{ color: string; count: number }[]>
  
  // Health
  isConnected(): Promise<boolean>
  migrate(): Promise<void>
}
