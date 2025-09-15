export interface AgentPlan {
  id: string
  goal: string
  constraints: any
  steps: PlanStep[]
  estimatedTime: number
  createdAt: Date
}

export interface PlanStep {
  id: string
  toolName: string
  parameters: any
  expectedOutput: string
  dependencies: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}

export interface AgentExecution {
  id: string
  planId: string
  steps: PlanStep[]
  currentStep: number
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  data?: any
  stepId?: string
}

export interface AgentCritique {
  id: string
  executionId: string
  overallScore: number
  stepScores: Array<{
    stepId: string
    score: number
    feedback: string
  }>
  suggestions: string[]
  shouldRetry: boolean
  revisedPlan?: AgentPlan
}

export interface StylistContext {
  userId: string
  goal: string
  constraints: {
    occasion?: string
    weather?: any
    formality?: string
    colors?: string[]
    avoidColors?: string[]
    comfort?: string[]
  }
  preferences: any
  feedbackHistory: any[]
}

export interface OutfitSuggestion {
  id: string
  items: Array<{
    id: string
    title: string
    category: string
    imageUrl: string
    colors: string[]
    formality: string
  }>
  rationale: string
  score: number
  confidence: number
  alternatives: string[]
}

export interface AgentConfig {
  maxRetries: number
  timeoutMs: number
  enableCritique: boolean
  enableLearning: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
