import { BaseAgent } from './base-agent'
import { AgentPlan, AgentExecution, AgentCritique } from './types'
import { getDatabase } from '../db'

export class InventoryAgent extends BaseAgent {
  async plan(goal: string, constraints: any, context: any): Promise<AgentPlan> {
    this.log('planning', 'info', `Planning inventory analysis for: ${goal}`)

    const steps = [
      {
        toolName: 'analyzeWearFrequency',
        parameters: { 
          userId: context.userId,
          days: constraints.days || 30
        },
        expectedOutput: 'Wear frequency analysis',
        dependencies: []
      },
      {
        toolName: 'detectGaps',
        parameters: {
          userId: context.userId,
          capsuleGoal: constraints.capsuleGoal || 'versatile'
        },
        expectedOutput: 'Wardrobe gap analysis',
        dependencies: []
      },
      {
        toolName: 'suggestOptimizations',
        parameters: {
          userId: context.userId,
          wearData: null, // Will be populated from analyzeWearFrequency
          gaps: null // Will be populated from detectGaps
        },
        expectedOutput: 'Inventory optimization suggestions',
        dependencies: ['analyzeWearFrequency', 'detectGaps']
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
            
            await this.executeInventoryStep(execution, step)
            
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
      this.log(execution.id, 'error', `Inventory execution failed: ${error}`)
      return execution
    }
  }

  async critique(execution: AgentExecution): Promise<AgentCritique> {
    const stepScores = execution.steps.map(step => ({
      stepId: step.id,
      score: step.status === 'completed' ? 0.85 : 0.15,
      feedback: step.status === 'completed' 
        ? 'Inventory step completed successfully' 
        : `Inventory step failed: ${step.error || 'Unknown error'}`
    }))

    const overallScore = stepScores.reduce((sum, s) => sum + s.score, 0) / stepScores.length
    
    const suggestions: string[] = []
    if (overallScore < 0.7) {
      suggestions.push('Check database connectivity')
      suggestions.push('Verify user data availability')
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

  private async executeInventoryStep(execution: AgentExecution, step: any): Promise<any> {
    this.log(execution.id, 'info', `Executing inventory step: ${step.toolName}`, { stepId: step.id })
    
    step.status = 'running'
    
    try {
      let result: any
      
      switch (step.toolName) {
        case 'analyzeWearFrequency':
          result = await this.analyzeWearFrequency(step.parameters.userId, step.parameters.days)
          break
        case 'detectGaps':
          result = await this.detectGaps(step.parameters.userId, step.parameters.capsuleGoal)
          break
        case 'suggestOptimizations':
          result = await this.suggestOptimizations(
            step.parameters.userId,
            step.parameters.wearData,
            step.parameters.gaps
          )
          break
        default:
          throw new Error(`Unknown inventory tool: ${step.toolName}`)
      }
      
      step.status = 'completed'
      step.result = result
      this.log(execution.id, 'info', `Inventory step completed successfully`, { stepId: step.id, result })
      
      return result
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : String(error)
      this.log(execution.id, 'error', `Inventory step execution error: ${step.error}`, { stepId: step.id })
      throw error
    }
  }

  private async analyzeWearFrequency(userId: string, days: number): Promise<any> {
    const db = await getDatabase()
    const wearFrequency = await db.getWearFrequency(userId, days)
    const mostUsedColors = await db.getMostUsedColors(userId)
    
    return {
      wearFrequency,
      mostUsedColors,
      analysis: {
        totalItems: wearFrequency.length,
        avgWearCount: wearFrequency.reduce((sum, item) => sum + item.count, 0) / wearFrequency.length,
        mostWornItem: wearFrequency[0],
        leastWornItem: wearFrequency[wearFrequency.length - 1]
      }
    }
  }

  private async detectGaps(userId: string, capsuleGoal: string): Promise<any> {
    const db = await getDatabase()
    const items = await db.searchItems({ userId })
    
    const gaps = this.analyzeWardrobeGaps(items, capsuleGoal)
    
    return {
      gaps,
      summary: {
        totalGaps: gaps.length,
        highPriorityGaps: gaps.filter(g => g.priority === 'high').length,
        mediumPriorityGaps: gaps.filter(g => g.priority === 'medium').length
      }
    }
  }

  private async suggestOptimizations(userId: string, wearData: any, gaps: any): Promise<any> {
    const suggestions = []
    
    // Suggest items to remove (over-worn or unused)
    if (wearData?.analysis?.mostWornItem?.count > 10) {
      suggestions.push({
        type: 'remove',
        itemId: wearData.analysis.mostWornItem.itemId,
        reason: 'Item has been worn too frequently and may need replacement',
        priority: 'medium'
      })
    }
    
    // Suggest items to add based on gaps
    if (gaps?.gaps) {
      gaps.gaps.forEach((gap: any) => {
        if (gap.priority === 'high') {
          suggestions.push({
            type: 'add',
            category: gap.category,
            reason: gap.reasoning,
            priority: 'high',
            specs: gap.suggestedSpecs
          })
        }
      })
    }
    
    return {
      suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        addSuggestions: suggestions.filter(s => s.type === 'add').length,
        removeSuggestions: suggestions.filter(s => s.type === 'remove').length
      }
    }
  }

  private analyzeWardrobeGaps(items: any[], capsuleGoal: string): any[] {
    const gaps = []
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

  private canExecuteStep(step: any, completedSteps: Set<string>): boolean {
    return step.dependencies.every((dep: string) => completedSteps.has(dep))
  }

  private updateStepParameters(step: any, allSteps: any[]): void {
    if (step.toolName === 'suggestOptimizations') {
      const wearStep = allSteps.find(s => s.toolName === 'analyzeWearFrequency' && s.status === 'completed')
      const gapsStep = allSteps.find(s => s.toolName === 'detectGaps' && s.status === 'completed')
      
      if (wearStep) step.parameters.wearData = wearStep.result
      if (gapsStep) step.parameters.gaps = gapsStep.result
    }
  }
}
