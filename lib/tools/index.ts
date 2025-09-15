import { WeatherTool } from './weather'
import { WardrobeTool } from './wardrobe'
import { ScoringTool } from './scoring'

export class ToolRegistry {
  private weatherTool: WeatherTool
  private wardrobeTool: WardrobeTool
  private scoringTool: ScoringTool

  constructor() {
    this.weatherTool = new WeatherTool()
    this.wardrobeTool = new WardrobeTool()
    this.scoringTool = new ScoringTool()
  }

  getWeatherTool(): WeatherTool {
    return this.weatherTool
  }

  getWardrobeTool(): WardrobeTool {
    return this.wardrobeTool
  }

  getScoringTool(): ScoringTool {
    return this.scoringTool
  }

  async executeTool(toolName: string, ...args: any[]): Promise<any> {
    const startTime = Date.now()
    
    try {
      let result
      
      switch (toolName) {
        case 'getWeather':
          result = await this.weatherTool.getWeather(args[0], args[1])
          break
        case 'searchWardrobe':
          result = await this.wardrobeTool.searchWardrobe(args[0], args[1], args[2])
          break
        case 'getLaundryStatus':
          result = await this.wardrobeTool.getLaundryStatus(args[0], args[1])
          break
        case 'markWorn':
          result = await this.wardrobeTool.markWorn(args[0], args[1])
          break
        case 'markClean':
          result = await this.wardrobeTool.markClean(args[0], args[1])
          break
        case 'scoreOutfit':
          result = await this.scoringTool.scoreOutfit(args[0], args[1], args[2], args[3])
          break
        case 'suggestGaps':
          result = await this.scoringTool.suggestGaps(args[0], args[1])
          break
        default:
          throw new Error(`Unknown tool: ${toolName}`)
      }

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime: Date.now() - startTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Tool execution failed: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName,
          timestamp: new Date()
        }
      }
    }
  }
}

export { WeatherTool } from './weather'
export { WardrobeTool } from './wardrobe'
export { ScoringTool } from './scoring'
export * from './types'
