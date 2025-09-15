import { LearningRule, FeedbackPattern, LearningMetrics } from './types'
import { getDatabase } from '../db'

export class FeedbackProcessor {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await getDatabase()
  }

  async processFeedback(
    userId: string,
    decision: 'accepted' | 'rejected',
    reason: string,
    outfitId?: string,
    items?: any[]
  ): Promise<void> {
    try {
      // Extract insights from feedback
      const insights = this.extractInsights(reason, decision, items)
      
      // Update or create learning rules
      await this.updateLearningRules(userId, insights)
      
      // Update feedback patterns
      await this.updateFeedbackPatterns(userId, decision, reason, outfitId)
      
      // Update user preferences based on patterns
      await this.updateUserPreferences(userId, insights)
      
    } catch (error) {
      console.error('Failed to process feedback:', error)
    }
  }

  private extractInsights(reason: string, decision: string, items?: any[]): any {
    const insights = {
      colorPreferences: [],
      formalityPreferences: [],
      comfortConstraints: [],
      stylePreferences: []
    }

    const reasonLower = reason.toLowerCase()

    // Color insights
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'gray', 'brown', 'navy']
    colors.forEach(color => {
      if (reasonLower.includes(color)) {
        insights.colorPreferences.push({
          color,
          preference: decision === 'accepted' ? 'prefer' : 'avoid',
          confidence: 0.8
        })
      }
    })

    // Formality insights
    const formalityKeywords = {
      formal: ['formal', 'dress', 'suit', 'elegant', 'sophisticated'],
      business: ['business', 'office', 'work', 'professional'],
      casual: ['casual', 'relaxed', 'comfortable', 'everyday'],
      sport: ['sport', 'gym', 'workout', 'athletic'],
      party: ['party', 'night', 'celebration', 'fun']
    }

    Object.entries(formalityKeywords).forEach(([formality, keywords]) => {
      if (keywords.some(keyword => reasonLower.includes(keyword))) {
        insights.formalityPreferences.push({
          formality,
          preference: decision === 'accepted' ? 'prefer' : 'avoid',
          confidence: 0.7
        })
      }
    })

    // Comfort constraints
    const comfortKeywords = ['tight', 'loose', 'uncomfortable', 'itchy', 'heavy', 'light', 'breathable']
    comfortKeywords.forEach(keyword => {
      if (reasonLower.includes(keyword)) {
        insights.comfortConstraints.push({
          constraint: keyword,
          preference: decision === 'accepted' ? 'prefer' : 'avoid',
          confidence: 0.9
        })
      }
    })

    return insights
  }

  private async updateLearningRules(userId: string, insights: any): Promise<void> {
    const existingRules = await this.getLearningRules(userId)
    
    // Process color preferences
    insights.colorPreferences.forEach((pref: any) => {
      const ruleId = `color_${pref.color}_${pref.preference}`
      const existingRule = existingRules.find((r: LearningRule) => r.id === ruleId)
      
      if (existingRule) {
        // Update existing rule
        existingRule.action.weight = Math.min(1, existingRule.action.weight + 0.1)
        existingRule.confidence = Math.min(1, existingRule.confidence + 0.05)
        existingRule.usageCount += 1
        existingRule.lastApplied = new Date()
      } else {
        // Create new rule
        const newRule: LearningRule = {
          id: ruleId,
          userId,
          condition: {
            type: 'color',
            value: pref.color,
            operator: 'equals'
          },
          action: {
            type: pref.preference === 'prefer' ? 'boost' : 'penalize',
            weight: 0.3,
            reason: `User ${pref.preference}s ${pref.color} colors`
          },
          confidence: pref.confidence,
          createdAt: new Date(),
          lastApplied: new Date(),
          usageCount: 1
        }
        existingRules.push(newRule)
      }
    })

    // Save updated rules
    await this.saveLearningRules(userId, existingRules)
  }

  private async updateFeedbackPatterns(
    userId: string,
    decision: string,
    reason: string,
    outfitId?: string
  ): Promise<void> {
    const pattern = await this.getFeedbackPattern(userId) || {
      userId,
      pattern: {
        rejectedReasons: [],
        acceptedReasons: [],
        commonRejections: [],
        commonAcceptances: []
      },
      insights: {
        preferredColors: [],
        avoidedColors: [],
        preferredFormality: 'casual',
        comfortConstraints: [],
        stylePreferences: []
      },
      lastUpdated: new Date()
    }

    // Update reason lists
    if (decision === 'rejected') {
      pattern.pattern.rejectedReasons.push(reason)
    } else {
      pattern.pattern.acceptedReasons.push(reason)
    }

    // Update common patterns
    this.updateCommonPatterns(pattern, decision, reason)

    // Update insights
    this.updatePatternInsights(pattern)

    pattern.lastUpdated = new Date()
    await this.saveFeedbackPattern(userId, pattern)
  }

  private updateCommonPatterns(pattern: FeedbackPattern, decision: string, reason: string): void {
    const reasonWords = reason.toLowerCase().split(' ').filter(word => word.length > 3)
    
    reasonWords.forEach(word => {
      if (decision === 'rejected') {
        const existing = pattern.pattern.commonRejections.find(r => r.reason === word)
        if (existing) {
          existing.count += 1
        } else {
          pattern.pattern.commonRejections.push({
            reason: word,
            count: 1,
            items: []
          })
        }
      } else {
        const existing = pattern.pattern.commonAcceptances.find(r => r.reason === word)
        if (existing) {
          existing.count += 1
        } else {
          pattern.pattern.commonAcceptances.push({
            reason: word,
            count: 1,
            items: []
          })
        }
      }
    })

    // Sort by count and keep top 10
    pattern.pattern.commonRejections.sort((a, b) => b.count - a.count)
    pattern.pattern.commonAcceptances.sort((a, b) => b.count - a.count)
    pattern.pattern.commonRejections = pattern.pattern.commonRejections.slice(0, 10)
    pattern.pattern.commonAcceptances = pattern.pattern.commonAcceptances.slice(0, 10)
  }

  private updatePatternInsights(pattern: FeedbackPattern): void {
    // Extract color preferences from patterns
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'gray']
    
    colors.forEach(color => {
      const rejections = pattern.pattern.commonRejections.filter(r => r.reason.includes(color))
      const acceptances = pattern.pattern.commonAcceptances.filter(r => r.reason.includes(color))
      
      if (rejections.length > acceptances.length) {
        if (!pattern.insights.avoidedColors.includes(color)) {
          pattern.insights.avoidedColors.push(color)
        }
      } else if (acceptances.length > rejections.length) {
        if (!pattern.insights.preferredColors.includes(color)) {
          pattern.insights.preferredColors.push(color)
        }
      }
    })

    // Extract formality preferences
    const formalityKeywords = {
      formal: ['formal', 'dress', 'suit'],
      business: ['business', 'office', 'work'],
      casual: ['casual', 'relaxed', 'comfortable']
    }

    Object.entries(formalityKeywords).forEach(([formality, keywords]) => {
      const acceptances = pattern.pattern.commonAcceptances.filter(r => 
        keywords.some(keyword => r.reason.includes(keyword))
      )
      if (acceptances.length > 0) {
        pattern.insights.preferredFormality = formality
      }
    })
  }

  private async updateUserPreferences(userId: string, insights: any): Promise<void> {
    const preferences = await this.db.getPreferences(userId) || {
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

    // Update color preferences
    insights.colorPreferences.forEach((pref: any) => {
      if (pref.preference === 'prefer' && !preferences.style.preferredColors.includes(pref.color)) {
        preferences.style.preferredColors.push(pref.color)
      } else if (pref.preference === 'avoid' && !preferences.style.avoidedColors.includes(pref.color)) {
        preferences.style.avoidedColors.push(pref.color)
      }
    })

    // Update formality preferences
    if (insights.formalityPreferences.length > 0) {
      const mostRecent = insights.formalityPreferences[insights.formalityPreferences.length - 1]
      if (mostRecent.preference === 'prefer') {
        preferences.style.formalityPreference = mostRecent.formality
      }
    }

    // Update comfort constraints
    insights.comfortConstraints.forEach((constraint: any) => {
      if (constraint.preference === 'avoid' && !preferences.style.comfortConstraints.includes(constraint.constraint)) {
        preferences.style.comfortConstraints.push(constraint.constraint)
      }
    })

    await this.db.updatePreferences(userId, preferences)
  }

  async getLearningMetrics(userId: string): Promise<LearningMetrics> {
    const feedback = await this.db.getUserFeedback(userId)
    const rules = await this.getLearningRules(userId)
    
    const totalFeedback = feedback.length
    const accepted = feedback.filter(f => f.decision === 'accepted').length
    const acceptanceRate = totalFeedback > 0 ? (accepted / totalFeedback) * 100 : 0

    return {
      totalFeedback,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      learningRules: rules.length,
      accuracyImprovement: this.calculateAccuracyImprovement(feedback),
      userSatisfaction: this.calculateUserSatisfaction(feedback),
      lastLearningUpdate: new Date()
    }
  }

  private calculateAccuracyImprovement(feedback: any[]): number {
    if (feedback.length < 10) return 0
    
    const recent = feedback.slice(-10)
    const older = feedback.slice(-20, -10)
    
    const recentAcceptance = recent.filter(f => f.decision === 'accepted').length / recent.length
    const olderAcceptance = older.filter(f => f.decision === 'accepted').length / older.length
    
    return Math.round((recentAcceptance - olderAcceptance) * 100)
  }

  private calculateUserSatisfaction(feedback: any[]): number {
    if (feedback.length === 0) return 0
    
    const recent = feedback.slice(-20) // Last 20 feedback items
    const acceptanceRate = recent.filter(f => f.decision === 'accepted').length / recent.length
    
    return Math.round(acceptanceRate * 100)
  }

  // Mock methods for database operations (would be implemented with actual database)
  private async getLearningRules(userId: string): Promise<LearningRule[]> {
    // In real implementation, this would query the database
    return []
  }

  private async saveLearningRules(userId: string, rules: LearningRule[]): Promise<void> {
    // In real implementation, this would save to database
  }

  private async getFeedbackPattern(userId: string): Promise<FeedbackPattern | null> {
    // In real implementation, this would query the database
    return null
  }

  private async saveFeedbackPattern(userId: string, pattern: FeedbackPattern): Promise<void> {
    // In real implementation, this would save to database
  }
}
