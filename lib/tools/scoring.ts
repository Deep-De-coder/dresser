import { OutfitScore, WeatherData, GapAnalysis, ToolResult } from './types'
import { getDatabase } from '../db'
import { Item } from '../db/types'

export class ScoringTool {
  async scoreOutfit(
    goal: string,
    constraints: any,
    weather: WeatherData,
    items: Item[]
  ): Promise<ToolResult<OutfitScore>> {
    const startTime = Date.now()
    
    try {
      const breakdown = {
        weather: this.scoreWeatherAppropriateness(items, weather),
        formality: this.scoreFormalityMatch(items, goal, constraints),
        colorHarmony: this.scoreColorHarmony(items),
        seasonality: this.scoreSeasonality(items, weather),
        wearFrequency: this.scoreWearFrequency(items)
      }

      const overallScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / Object.keys(breakdown).length
      
      const suggestions = this.generateSuggestions(breakdown, items, weather, goal)
      const rationale = this.generateRationale(breakdown, overallScore, goal, weather)

      return {
        success: true,
        data: {
          score: Math.round(overallScore * 100) / 100,
          rationale,
          breakdown,
          suggestions
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'outfit-scoring',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Outfit scoring failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'outfit-scoring',
          timestamp: new Date()
        }
      }
    }
  }

  private scoreWeatherAppropriateness(items: Item[], weather: WeatherData): number {
    let score = 0.5 // Base score
    
    // Temperature appropriateness
    const avgTemp = weather.temperature
    items.forEach(item => {
      if (item.category === 'jacket' && avgTemp < 15) score += 0.1
      if (item.category === 'shirt' && avgTemp > 20) score += 0.1
      if (item.fabric === 'wool' && avgTemp < 10) score += 0.1
      if (item.fabric === 'cotton' && avgTemp > 25) score += 0.1
    })

    // Precipitation handling
    if (weather.precipitation > 0) {
      const hasWaterproof = items.some(item => 
        item.fabric === 'leather' || item.category === 'jacket'
      )
      if (hasWaterproof) score += 0.2
    }

    return Math.min(1, Math.max(0, score))
  }

  private scoreFormalityMatch(items: Item[], goal: string, constraints: any): number {
    const formalityMap = {
      casual: 0.2,
      business: 0.6,
      formal: 0.9,
      sport: 0.1,
      party: 0.8,
      outdoor: 0.3
    }

    const targetFormality = this.extractFormalityFromGoal(goal) || constraints?.formality || 'casual'
    const targetScore = formalityMap[targetFormality as keyof typeof formalityMap] || 0.5

    const avgFormality = items.reduce((sum, item) => {
      const itemFormality = formalityMap[item.formality as keyof typeof formalityMap] || 0.5
      return sum + itemFormality
    }, 0) / items.length

    const difference = Math.abs(targetScore - avgFormality)
    return Math.max(0, 1 - difference * 2)
  }

  private scoreColorHarmony(items: Item[]): number {
    if (items.length < 2) return 0.5

    const colors = items.flatMap(item => item.colors)
    const uniqueColors = [...new Set(colors)]
    
    // Simple color harmony rules
    const neutralColors = ['black', 'white', 'gray', 'brown', 'beige', 'navy']
    const neutralCount = colors.filter(color => neutralColors.includes(color)).length
    
    // Good if we have some neutrals and not too many bright colors
    const brightColors = colors.filter(color => !neutralColors.includes(color))
    const harmonyScore = neutralCount > 0 && brightColors.length <= 2 ? 0.8 : 0.4
    
    return harmonyScore
  }

  private scoreSeasonality(items: Item[], weather: WeatherData): number {
    const season = this.getSeasonFromWeather(weather)
    let score = 0.5

    items.forEach(item => {
      if (item.seasons.includes(season)) {
        score += 0.1
      }
    })

    return Math.min(1, score)
  }

  private scoreWearFrequency(items: Item[]): number {
    const avgWearCount = items.reduce((sum, item) => sum + item.wearCount, 0) / items.length
    
    // Prefer items that haven't been worn too much recently
    if (avgWearCount < 3) return 0.8
    if (avgWearCount < 7) return 0.6
    return 0.3
  }

  private extractFormalityFromGoal(goal: string): string | null {
    const goalLower = goal.toLowerCase()
    if (goalLower.includes('formal') || goalLower.includes('dress') || goalLower.includes('suit')) return 'formal'
    if (goalLower.includes('business') || goalLower.includes('office') || goalLower.includes('work')) return 'business'
    if (goalLower.includes('casual') || goalLower.includes('relaxed') || goalLower.includes('comfortable')) return 'casual'
    if (goalLower.includes('sport') || goalLower.includes('gym') || goalLower.includes('workout')) return 'sport'
    if (goalLower.includes('party') || goalLower.includes('night') || goalLower.includes('celebration')) return 'party'
    if (goalLower.includes('outdoor') || goalLower.includes('hiking') || goalLower.includes('camping')) return 'outdoor'
    return null
  }

  private getSeasonFromWeather(weather: WeatherData): string {
    const temp = weather.temperature
    if (temp < 5) return 'Winter'
    if (temp < 15) return 'Fall'
    if (temp < 25) return 'Spring'
    return 'Summer'
  }

  private generateSuggestions(breakdown: any, items: Item[], weather: WeatherData, goal: string): string[] {
    const suggestions: string[] = []

    if (breakdown.weather < 0.6) {
      suggestions.push('Consider adding a jacket or adjusting layers for the weather')
    }
    if (breakdown.formality < 0.6) {
      suggestions.push('Try adding more formal pieces or adjusting the formality level')
    }
    if (breakdown.colorHarmony < 0.6) {
      suggestions.push('Consider adding neutral colors to balance the outfit')
    }
    if (breakdown.wearFrequency < 0.5) {
      suggestions.push('Try incorporating some less-worn items to refresh your look')
    }

    return suggestions
  }

  private generateRationale(breakdown: any, overallScore: number, goal: string, weather: WeatherData): string {
    const strengths = Object.entries(breakdown)
      .filter(([_, score]) => (score as number) > 0.7)
      .map(([key, _]) => key)
    
    const weaknesses = Object.entries(breakdown)
      .filter(([_, score]) => (score as number) < 0.5)
      .map(([key, _]) => key)

    let rationale = `This outfit scores ${Math.round(overallScore * 100)}% for your ${goal} goal. `
    
    if (strengths.length > 0) {
      rationale += `Strengths include ${strengths.join(', ')}. `
    }
    
    if (weaknesses.length > 0) {
      rationale += `Areas for improvement: ${weaknesses.join(', ')}. `
    }

    rationale += `Weather conditions: ${weather.temperature}°C, ${weather.condition}.`

    return rationale
  }

  async suggestGaps(userId: string, capsuleGoal: string): Promise<ToolResult<GapAnalysis[]>> {
    const startTime = Date.now()
    
    try {
      const db = await getDatabase()
      const items = await db.searchItems({ userId })
      
      const gaps = this.analyzeWardrobeGaps(items, capsuleGoal)

      return {
        success: true,
        data: gaps,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'gap-analysis',
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Gap analysis failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'gap-analysis',
          timestamp: new Date()
        }
      }
    }
  }

  private analyzeWardrobeGaps(items: Item[], capsuleGoal: string): GapAnalysis[] {
    const gaps: GapAnalysis[] = []
    const categories = ['shirt', 'pants', 'jacket', 'dress', 'shoes', 'accessory']
    
    categories.forEach(category => {
      const categoryItems = items.filter(item => item.category === category)
      
      if (categoryItems.length === 0) {
        gaps.push({
          category,
          priority: 'high',
          description: `No ${category} items found`,
          suggestedSpecs: this.getDefaultSpecs(category, capsuleGoal),
          reasoning: `Essential ${category} needed for a complete wardrobe`
        })
      } else if (categoryItems.length < 2) {
        gaps.push({
          category,
          priority: 'medium',
          description: `Limited ${category} options`,
          suggestedSpecs: this.getDefaultSpecs(category, capsuleGoal),
          reasoning: `More variety in ${category} would increase outfit combinations`
        })
      }
    })

    return gaps
  }

  private getDefaultSpecs(category: string, capsuleGoal: string): any {
    const baseSpecs = {
      colors: ['black', 'white', 'navy'],
      formality: 'casual',
      seasons: ['Spring', 'Summer', 'Fall', 'Winter']
    }

    // Customize based on category and goal
    if (category === 'shirt') {
      return { ...baseSpecs, colors: ['white', 'blue', 'gray'] }
    }
    if (category === 'pants') {
      return { ...baseSpecs, colors: ['black', 'navy', 'khaki'] }
    }
    if (category === 'jacket') {
      return { ...baseSpecs, colors: ['black', 'navy'], fabric: 'wool' }
    }

    return baseSpecs
  }
}
