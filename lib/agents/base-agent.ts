import { AgentPlan, PlanStep, AgentExecution, ExecutionLog, AgentCritique, AgentConfig } from './types'
import { ToolRegistry } from '../tools'

export abstract class BaseAgent {
  protected toolRegistry: ToolRegistry
  protected config: AgentConfig
  protected executions: Map<string, AgentExecution> = new Map()

  constructor(toolRegistry: ToolRegistry, config?: Partial<AgentConfig>) {
    this.toolRegistry = toolRegistry
    this.config = {
      maxRetries: 3,
      timeoutMs: 30000,
      enableCritique: true,
      enableLearning: true,
      logLevel: 'info',
      ...config
    }
  }

  abstract plan(goal: string, constraints: any, context: any): Promise<AgentPlan>
  abstract execute(plan: AgentPlan): Promise<AgentExecution>
  abstract critique(execution: AgentExecution): Promise<AgentCritique>

  protected createPlan(goal: string, constraints: any, steps: Omit<PlanStep, 'id' | 'status'>[]): AgentPlan {
    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goal,
      constraints,
      steps: steps.map(step => ({
        ...step,
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      })),
      estimatedTime: steps.length * 2000, // 2 seconds per step estimate
      createdAt: new Date()
    }
  }

  protected createExecution(plan: AgentPlan): AgentExecution {
    const execution: AgentExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      planId: plan.id,
      steps: [...plan.steps],
      currentStep: 0,
      status: 'running',
      startTime: new Date(),
      logs: []
    }

    this.executions.set(execution.id, execution)
    return execution
  }

  protected async executeStep(execution: AgentExecution, step: PlanStep): Promise<any> {
    this.log(execution.id, 'info', `Executing step: ${step.toolName}`, { stepId: step.id })
    
    step.status = 'running'
    
    try {
      const result = await this.toolRegistry.executeTool(step.toolName, ...Object.values(step.parameters))
      
      if (result.success) {
        step.status = 'completed'
        step.result = result.data
        this.log(execution.id, 'info', `Step completed successfully`, { stepId: step.id, result })
      } else {
        step.status = 'failed'
        step.error = result.error
        this.log(execution.id, 'error', `Step failed: ${result.error}`, { stepId: step.id })
      }
      
      return result
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : String(error)
      this.log(execution.id, 'error', `Step execution error: ${step.error}`, { stepId: step.id })
      throw error
    }
  }

  protected log(executionId: string, level: ExecutionLog['level'], message: string, data?: any, stepId?: string): void {
    const log: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      data,
      stepId
    }

    const execution = this.executions.get(executionId)
    if (execution) {
      execution.logs.push(log)
    }

    if (this.shouldLog(level)) {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '')
    }
  }

  private shouldLog(level: ExecutionLog['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError!
  }

  getExecution(id: string): AgentExecution | undefined {
    return this.executions.get(id)
  }

  getAllExecutions(): AgentExecution[] {
    return Array.from(this.executions.values())
  }

  protected validatePlan(plan: AgentPlan): boolean {
    // Check for circular dependencies
    const visited = new Set<string>()
    const visiting = new Set<string>()
    
    const hasCycle = (stepId: string): boolean => {
      if (visiting.has(stepId)) return true
      if (visited.has(stepId)) return false
      
      visiting.add(stepId)
      const step = plan.steps.find(s => s.id === stepId)
      
      if (step) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) return true
        }
      }
      
      visiting.delete(stepId)
      visited.add(stepId)
      return false
    }
    
    for (const step of plan.steps) {
      if (hasCycle(step.id)) {
        return false
      }
    }
    
    return true
  }
}
