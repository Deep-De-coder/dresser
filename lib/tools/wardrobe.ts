import { WardrobeSearchFilters, WardrobeSearchResult, ToolResult } from './types'
import { getDatabase } from '../db'

export class WardrobeTool {
  async searchWardrobe(
    userId: string, 
    filters: WardrobeSearchFilters,
    embeddingQuery?: number[]
  ): Promise<ToolResult<WardrobeSearchResult>> {
    const startTime = Date.now()
    
    try {
      const db = await getDatabase()
      
      // Convert filters to database format
      const dbFilters = {
        userId,
        category: filters.category,
        colors: filters.colors,
        seasons: filters.seasons,
        formality: filters.formality,
        isClean: filters.isClean
      }

      let items
      if (embeddingQuery && embeddingQuery.length > 0) {
        // Semantic search using embeddings
        const similarItems = await db.findSimilarItems({
          embedding: embeddingQuery,
          threshold: 0.7,
          limit: 50
        })
        items = similarItems.filter(item => item.userId === userId)
      } else {
        // Traditional filter-based search
        items = await db.searchItems(dbFilters)
      }

      // Apply additional filters
      if (filters.maxWearCount !== undefined) {
        items = items.filter(item => item.wearCount <= filters.maxWearCount!)
      }

      // Sort by relevance (clean items first, then by wear count)
      items.sort((a, b) => {
        if (a.isClean !== b.isClean) {
          return a.isClean ? -1 : 1
        }
        return a.wearCount - b.wearCount
      })

      const result: WardrobeSearchResult = {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          colors: item.colors,
          formality: item.formality,
          isClean: item.isClean,
          wearCount: item.wearCount
        })),
        totalCount: items.length,
        filters
      }

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'wardrobe-search',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Wardrobe search failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'wardrobe-search',
          timestamp: new Date()
        }
      }
    }
  }

  async getLaundryStatus(userId: string, itemIds: string[]): Promise<ToolResult<Array<{ itemId: string; isClean: boolean; lastWorn?: Date; wearCount: number }>>> {
    const startTime = Date.now()
    
    try {
      const db = await getDatabase()
      const results = []

      for (const itemId of itemIds) {
        const item = await db.getItem(itemId)
        if (item && item.userId === userId) {
          results.push({
            itemId: item.id,
            isClean: item.isClean,
            lastWorn: item.wearCount > 0 ? new Date() : undefined, // Simplified
            wearCount: item.wearCount
          })
        }
      }

      return {
        success: true,
        data: results,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'laundry-status',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Laundry status check failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'laundry-status',
          timestamp: new Date()
        }
      }
    }
  }

  async markWorn(userId: string, itemId: string): Promise<ToolResult<void>> {
    const startTime = Date.now()
    
    try {
      const db = await getDatabase()
      const item = await db.getItem(itemId)
      
      if (!item || item.userId !== userId) {
        throw new Error('Item not found or access denied')
      }

      await db.updateItem(itemId, {
        wearCount: item.wearCount + 1,
        isClean: false // Mark as dirty after wearing
      })

      return {
        success: true,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'mark-worn',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Mark worn failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'mark-worn',
          timestamp: new Date()
        }
      }
    }
  }

  async markClean(userId: string, itemId: string): Promise<ToolResult<void>> {
    const startTime = Date.now()
    
    try {
      const db = await getDatabase()
      const item = await db.getItem(itemId)
      
      if (!item || item.userId !== userId) {
        throw new Error('Item not found or access denied')
      }

      await db.updateItem(itemId, {
        isClean: true
      })

      return {
        success: true,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'mark-clean',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Mark clean failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'mark-clean',
          timestamp: new Date()
        }
      }
    }
  }
}
