import { BaseAgent } from './base-agent'
import { AgentPlan, AgentExecution, AgentCritique } from './types'
import { PerceptionAgent } from '../perception'
import { getDatabase } from '../db'

export class PerceptionAgentWrapper extends BaseAgent {
  private perceptionAgent: PerceptionAgent

  constructor(toolRegistry: any, perceptionAgent: PerceptionAgent, config?: any) {
    super(toolRegistry, config)
    this.perceptionAgent = perceptionAgent
  }

  async plan(goal: string, constraints: any, context: any): Promise<AgentPlan> {
    this.log('planning', 'info', `Planning perception analysis for: ${goal}`)

    const steps = [
      {
        toolName: 'analyzeImage',
        parameters: { 
          imageUrl: context.imageUrl,
          userId: context.userId
        },
        expectedOutput: 'Image analysis with attributes and embedding',
        dependencies: []
      },
      {
        toolName: 'detectDuplicates',
        parameters: {
          analysis: null, // Will be populated from analyzeImage
          userId: context.userId
        },
        expectedOutput: 'Duplicate detection results',
        dependencies: ['analyzeImage']
      },
      {
        toolName: 'enrichItem',
        parameters: {
          itemId: context.itemId,
          userId: context.userId,
          analysis: null // Will be populated from analyzeImage
        },
        expectedOutput: 'Enriched item data',
        dependencies: ['analyzeImage', 'detectDuplicates']
      }
    ]

    return this.createPlan(goal, constraints, steps)
  }

  async execute(plan: AgentPlan): Promise<AgentExecution> {
    const execution = this.createExecution(plan)
    
    try {
      // Execute steps in dependency order
      const completedSteps = new Set<string>()
      let hasProgress = true

      while (hasProgress && completedSteps.size < plan.steps.length) {
        hasProgress = false
        
        for (const step of execution.steps) {
          if (step.status === 'pending' && this.canExecuteStep(step, completedSteps)) {
            // Update parameters with results from dependencies
            this.updateStepParameters(step, execution.steps)
            
            await this.executePerceptionStep(execution, step)
            
            if (step.status === 'completed') {
              completedSteps.add(step.id)
              hasProgress = true
            }
          }
        }
      }

      if (completedSteps.size === plan.steps.length) {
        execution.status = 'completed'
        execution.endTime = new Date()
      } else {
        execution.status = 'failed'
        execution.endTime = new Date()
      }

      return execution
    } catch (error) {
      execution.status = 'failed'
      execution.endTime = new Date()
      this.log(execution.id, 'error', `Perception execution failed: ${error}`)
      return execution
    }
  }

  async critique(execution: AgentExecution): Promise<AgentCritique> {
    const stepScores = execution.steps.map(step => ({
      stepId: step.id,
      score: step.status === 'completed' ? 0.9 : 0.1,
      feedback: step.status === 'completed' 
        ? 'Perception step completed successfully' 
        : `Perception step failed: ${step.error || 'Unknown error'}`
    }))

    const overallScore = stepScores.reduce((sum, s) => sum + s.score, 0) / stepScores.length
    
    const suggestions: string[] = []
    if (overallScore < 0.8) {
      suggestions.push('Check image quality and format')
      suggestions.push('Verify perception service availability')
    }

    const shouldRetry = overallScore < 0.5 && execution.status === 'failed'

    return {
      id: `critique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executionId: execution.id,
      overallScore,
      stepScores,
      suggestions,
      shouldRetry
    }
  }

  private async executePerceptionStep(execution: AgentExecution, step: any): Promise<any> {
    this.log(execution.id, 'info', `Executing perception step: ${step.toolName}`, { stepId: step.id })
    
    step.status = 'running'
    
    try {
      let result: any
      
      switch (step.toolName) {
        case 'analyzeImage':
          result = await this.perceptionAgent.embeddingService.analyzeImage(step.parameters.imageUrl)
          break
        case 'detectDuplicates':
          result = await this.perceptionAgent.detectDuplicates(step.parameters.analysis, step.parameters.userId)
          break
        case 'enrichItem':
          await this.perceptionAgent.enrichItem(step.parameters.itemId, step.parameters.userId)
          result = { success: true, message: 'Item enriched successfully' }
          break
        default:
          throw new Error(`Unknown perception tool: ${step.toolName}`)
      }
      
      step.status = 'completed'
      step.result = result
      this.log(execution.id, 'info', `Perception step completed successfully`, { stepId: step.id, result })
      
      return result
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : String(error)
      this.log(execution.id, 'error', `Perception step execution error: ${step.error}`, { stepId: step.id })
      throw error
    }
  }

  private canExecuteStep(step: any, completedSteps: Set<string>): boolean {
    return step.dependencies.every((dep: string) => completedSteps.has(dep))
  }

  private updateStepParameters(step: any, allSteps: any[]): void {
    if (step.toolName === 'detectDuplicates') {
      const analysisStep = allSteps.find(s => s.toolName === 'analyzeImage' && s.status === 'completed')
      if (analysisStep && analysisStep.result) {
        step.parameters.analysis = analysisStep.result
      }
    }
    
    if (step.toolName === 'enrichItem') {
      const analysisStep = allSteps.find(s => s.toolName === 'analyzeImage' && s.status === 'completed')
      if (analysisStep && analysisStep.result) {
        step.parameters.analysis = analysisStep.result
      }
    }
  }

  async processUpload(file: File, userId: string): Promise<{
    analysis: any
    duplicateDetection: any
    shouldUpload: boolean
  }> {
    return this.perceptionAgent.processUpload(file, userId)
  }
}
