export interface LearningRule {
  id: string
  userId: string
  condition: {
    type: 'color' | 'formality' | 'category' | 'fabric' | 'pattern'
    value: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains'
  }
  action: {
    type: 'boost' | 'penalize' | 'avoid' | 'prefer'
    weight: number
    reason: string
  }
  confidence: number
  createdAt: Date
  lastApplied: Date
  usageCount: number
}

export interface FeedbackPattern {
  userId: string
  pattern: {
    rejectedReasons: string[]
    acceptedReasons: string[]
    commonRejections: Array<{
      reason: string
      count: number
      items: string[]
    }>
    commonAcceptances: Array<{
      reason: string
      count: number
      items: string[]
    }>
  }
  insights: {
    preferredColors: string[]
    avoidedColors: string[]
    preferredFormality: string
    comfortConstraints: string[]
    stylePreferences: string[]
  }
  lastUpdated: Date
}

export interface LearningMetrics {
  totalFeedback: number
  acceptanceRate: number
  learningRules: number
  accuracyImprovement: number
  userSatisfaction: number
  lastLearningUpdate: Date
}

export interface PrivacySettings {
  userId: string
  localFirstImages: boolean
  shareAnalytics: boolean
  storePersonalData: boolean
  allowLearning: boolean
  dataRetentionDays: number
  exportData: boolean
  deleteData: boolean
}
