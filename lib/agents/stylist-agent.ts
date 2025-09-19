import { BaseAgent } from './base-agent'
import { StylistContext, OutfitSuggestion, AgentPlan, AgentExecution, AgentCritique } from './types'
import { getDatabase } from '../db'

export class StylistAgent extends BaseAgent {
  async plan(goal: string, constraints: any, context: StylistContext): Promise<AgentPlan> {
    this.log('planning', 'info', `Planning outfit for goal: ${goal}`)

    const steps = [
      {
        toolName: 'getWeather',
        parameters: { city: context.constraints.weather?.city || 'New York', date: new Date().toISOString() },
        expectedOutput: 'Weather data for outfit planning',
        dependencies: []
      },
      {
        toolName: 'searchWardrobe',
        parameters: { 
          userId: context.userId, 
          filters: this.buildWardrobeFilters(constraints, context),
          embeddingQuery: null
        },
        expectedOutput: 'Available wardrobe items',
        dependencies: []
      },
      {
        toolName: 'getLaundryStatus',
        parameters: { 
          userId: context.userId, 
          itemIds: [] // Will be populated from search results
        },
        expectedOutput: 'Laundry status of items',
        dependencies: ['searchWardrobe']
      },
      {
        toolName: 'scoreOutfit',
        parameters: {
          goal,
          constraints,
          weather: null, // Will be populated from weather step
          items: null // Will be populated from wardrobe search
        },
        expectedOutput: 'Outfit score and rationale',
        dependencies: ['getWeather', 'searchWardrobe', 'getLaundryStatus']
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
            
            await this.executeStep(execution, step)
            
            if ((step as any).status === 'completed') {
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
      this.log(execution.id, 'error', `Execution failed: ${error}`)
      return execution
    }
  }

  async critique(execution: AgentExecution): Promise<AgentCritique> {
    const stepScores = execution.steps.map(step => ({
      stepId: step.id,
      score: step.status === 'completed' ? 0.8 : 0.2,
      feedback: step.status === 'completed' 
        ? 'Step executed successfully' 
        : `Step failed: ${step.error || 'Unknown error'}`
    }))

    const overallScore = stepScores.reduce((sum, s) => sum + s.score, 0) / stepScores.length
    
    const suggestions: string[] = []
    if (overallScore < 0.7) {
      suggestions.push('Consider retrying with different parameters')
      suggestions.push('Check if all required tools are available')
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

  async generateOutfitSuggestions(context: StylistContext): Promise<OutfitSuggestion[]> {
    const plan = await this.plan(context.goal, context.constraints, context)
    const execution = await this.execute(plan)
    
    if (execution.status !== 'completed') {
      const critique = await this.critique(execution)
      if (critique.shouldRetry) {
        // Retry with revised plan
        const retryExecution = await this.execute(plan)
        return this.extractOutfitSuggestions(retryExecution)
      }
      throw new Error('Failed to generate outfit suggestions')
    }

    return this.extractOutfitSuggestions(execution)
  }

  private buildWardrobeFilters(constraints: any, context: StylistContext) {
    return {
      category: constraints.category,
      colors: constraints.colors,
      seasons: constraints.seasons,
      formality: constraints.formality || context.constraints.formality,
      isClean: true, // Prefer clean items
      maxWearCount: 10 // Avoid over-worn items
    }
  }

  private canExecuteStep(step: any, completedSteps: Set<string>): boolean {
    return step.dependencies.every((dep: string) => completedSteps.has(dep))
  }

  private updateStepParameters(step: any, allSteps: any[]): void {
    if (step.toolName === 'getLaundryStatus') {
      const searchStep = allSteps.find(s => s.toolName === 'searchWardrobe' && s.status === 'completed')
      if (searchStep && searchStep.result) {
        step.parameters.itemIds = searchStep.result.items.map((item: any) => item.id)
      }
    }
    
    if (step.toolName === 'scoreOutfit') {
      const weatherStep = allSteps.find(s => s.toolName === 'getWeather' && s.status === 'completed')
      const searchStep = allSteps.find(s => s.toolName === 'searchWardrobe' && s.status === 'completed')
      
      if (weatherStep) step.parameters.weather = weatherStep.result
      if (searchStep) step.parameters.items = searchStep.result.items
    }
  }

  private extractOutfitSuggestions(execution: AgentExecution): OutfitSuggestion[] {
    const suggestions: OutfitSuggestion[] = []
    
    // Extract outfit combinations from the execution results
    const searchStep = execution.steps.find(s => s.toolName === 'searchWardrobe' && s.status === 'completed')
    const scoreStep = execution.steps.find(s => s.toolName === 'scoreOutfit' && s.status === 'completed')
    
    if (searchStep && searchStep.result) {
      const items = searchStep.result.items
      const score = scoreStep?.result || { score: 0.7, rationale: 'Generated outfit suggestion' }
      
      // Generate 2-3 outfit combinations
      const combinations = this.generateOutfitCombinations(items)
      
      combinations.forEach((combination, index) => {
        suggestions.push({
          id: `outfit_${Date.now()}_${index}`,
          items: combination,
          rationale: score.rationale,
          score: score.score,
          confidence: 0.8,
          alternatives: this.generateAlternatives(combination, items)
        })
      })
    }
    
    return suggestions
  }

  private generateOutfitCombinations(items: any[]): any[][] {
    const combinations: any[][] = []
    
    // Simple combination logic - in practice, this would be more sophisticated
    const shirts = items.filter(item => item.category === 'shirt')
    const pants = items.filter(item => item.category === 'pants')
    const jackets = items.filter(item => item.category === 'jacket')
    const shoes = items.filter(item => item.category === 'shoes')
    
    for (let i = 0; i < Math.min(3, shirts.length); i++) {
      for (let j = 0; j < Math.min(3, pants.length); j++) {
        const combination = [shirts[i], pants[j]]
        
        if (jackets.length > 0) {
          combination.push(jackets[Math.floor(Math.random() * jackets.length)])
        }
        
        if (shoes.length > 0) {
          combination.push(shoes[Math.floor(Math.random() * shoes.length)])
        }
        
        combinations.push(combination)
        
        if (combinations.length >= 3) break
      }
      if (combinations.length >= 3) break
    }
    
    return combinations
  }

  private generateAlternatives(combination: any[], allItems: any[]): string[] {
    return [
      'Try a different color combination',
      'Consider adding an accessory',
      'Switch to a different style'
    ]
  }
}
