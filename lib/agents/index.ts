import { BaseAgent } from './base-agent'
import { StylistAgent } from './stylist-agent'
import { PerceptionAgentWrapper } from './perception-agent'
import { InventoryAgent } from './inventory-agent'
import { ToolRegistry } from '../tools'
import { PerceptionAgent } from '../perception'

export class AgentOrchestrator {
  private stylistAgent: StylistAgent
  private perceptionAgent: PerceptionAgentWrapper
  private inventoryAgent: InventoryAgent
  private toolRegistry: ToolRegistry

  constructor() {
    this.toolRegistry = new ToolRegistry()
    this.stylistAgent = new StylistAgent(this.toolRegistry)
    this.inventoryAgent = new InventoryAgent(this.toolRegistry)
    
    // Initialize perception agent with the actual perception service
    const perceptionService = new PerceptionAgent()
    this.perceptionAgent = new PerceptionAgentWrapper(this.toolRegistry, perceptionService)
  }

  getStylistAgent(): StylistAgent {
    return this.stylistAgent
  }

  getPerceptionAgent(): PerceptionAgentWrapper {
    return this.perceptionAgent
  }

  getInventoryAgent(): InventoryAgent {
    return this.inventoryAgent
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry
  }

  async executeStylistRequest(context: any): Promise<any> {
    try {
      const suggestions = await this.stylistAgent.generateOutfitSuggestions(context)
      return {
        success: true,
        suggestions,
        metadata: {
          agent: 'stylist',
          timestamp: new Date(),
          executionTime: Date.now()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Stylist agent failed: ${error}`,
        metadata: {
          agent: 'stylist',
          timestamp: new Date()
        }
      }
    }
  }

  async executePerceptionRequest(file: File, userId: string): Promise<any> {
    try {
      const result = await this.perceptionAgent.processUpload(file, userId)
      return {
        success: true,
        result,
        metadata: {
          agent: 'perception',
          timestamp: new Date(),
          executionTime: Date.now()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Perception agent failed: ${error}`,
        metadata: {
          agent: 'perception',
          timestamp: new Date()
        }
      }
    }
  }

  async executeInventoryRequest(userId: string, goal: string, constraints: any): Promise<any> {
    try {
      const plan = await this.inventoryAgent.plan(goal, constraints, { userId })
      const execution = await this.inventoryAgent.execute(plan)
      const critique = await this.inventoryAgent.critique(execution)
      
      return {
        success: true,
        plan,
        execution,
        critique,
        metadata: {
          agent: 'inventory',
          timestamp: new Date(),
          executionTime: Date.now()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Inventory agent failed: ${error}`,
        metadata: {
          agent: 'inventory',
          timestamp: new Date()
        }
      }
    }
  }

  // Get execution logs for debugging and transparency
  getAllExecutions(): any[] {
    return [
      ...this.stylistAgent.getAllExecutions(),
      ...this.inventoryAgent.getAllExecutions()
    ]
  }

  // Get agent health status
  getAgentStatus(): any {
    return {
      stylist: {
        status: 'healthy',
        lastExecution: this.stylistAgent.getAllExecutions().slice(-1)[0]?.startTime
      },
      perception: {
        status: 'healthy',
        capabilities: this.perceptionAgent.getClientCapabilities()
      },
      inventory: {
        status: 'healthy',
        lastExecution: this.inventoryAgent.getAllExecutions().slice(-1)[0]?.startTime
      }
    }
  }
}

export { BaseAgent } from './base-agent'
export { StylistAgent } from './stylist-agent'
export { PerceptionAgentWrapper } from './perception-agent'
export { InventoryAgent } from './inventory-agent'
export * from './types'
