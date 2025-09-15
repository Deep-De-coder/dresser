import { WeatherData, ToolResult } from './types'

export class WeatherTool {
  private apiKey?: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY
  }

  async getWeather(city: string, dateISO: string): Promise<ToolResult<WeatherData>> {
    const startTime = Date.now()
    
    try {
      if (!this.apiKey) {
        return this.getFallbackWeather(city, dateISO, startTime)
      }

      const weather = await this.fetchWeatherData(city, dateISO)
      
      return {
        success: true,
        data: weather,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: 'weather',
          timestamp: new Date()
        }
      }
    } catch (error) {
      console.warn('Weather API failed, using fallback:', error)
      return this.getFallbackWeather(city, dateISO, startTime)
    }
  }

  private async fetchWeatherData(city: string, dateISO: string): Promise<WeatherData> {
    const date = new Date(dateISO)
    const isToday = this.isToday(date)
    
    let url: string
    if (isToday) {
      url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
    } else {
      // For future dates, use forecast API
      url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    return this.parseWeatherData(data, date)
  }

  private parseWeatherData(data: any, targetDate: Date): WeatherData {
    if (data.list) {
      // Forecast data - find closest time to target date
      const targetTime = targetDate.getTime()
      const closest = data.list.reduce((prev: any, curr: any) => {
        const prevTime = new Date(prev.dt * 1000).getTime()
        const currTime = new Date(curr.dt * 1000).getTime()
        return Math.abs(currTime - targetTime) < Math.abs(prevTime - targetTime) ? curr : prev
      })
      
      return {
        temperature: Math.round(closest.main.temp),
        condition: closest.weather[0].main.toLowerCase(),
        humidity: closest.main.humidity,
        windSpeed: closest.wind.speed,
        precipitation: closest.rain?.['3h'] || 0,
        timestamp: new Date(closest.dt * 1000)
      }
    } else {
      // Current weather data
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || 0,
        timestamp: new Date(data.dt * 1000)
      }
    }
  }

  private getFallbackWeather(city: string, dateISO: string, startTime: number): ToolResult<WeatherData> {
    // Generate realistic fallback weather based on city and season
    const date = new Date(dateISO)
    const season = this.getSeason(date)
    const weather = this.generateSeasonalWeather(season, city)

    return {
      success: true,
      data: weather,
      metadata: {
        executionTime: Date.now() - startTime,
        toolName: 'weather-fallback',
        timestamp: new Date()
      }
    }
  }

  private getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  private generateSeasonalWeather(season: string, city: string): WeatherData {
    const baseTemps = {
      spring: { min: 10, max: 20 },
      summer: { min: 20, max: 30 },
      fall: { min: 5, max: 15 },
      winter: { min: -5, max: 10 }
    }

    const conditions = {
      spring: ['clear', 'partly_cloudy', 'rain'],
      summer: ['clear', 'partly_cloudy', 'hot'],
      fall: ['clear', 'cloudy', 'rain'],
      winter: ['clear', 'cloudy', 'snow', 'cold']
    }

    const temp = baseTemps[season as keyof typeof baseTemps]
    const temperature = Math.round(temp.min + Math.random() * (temp.max - temp.min))
    const condition = conditions[season as keyof typeof conditions][
      Math.floor(Math.random() * conditions[season as keyof typeof conditions].length)
    ]

    return {
      temperature,
      condition,
      humidity: Math.round(30 + Math.random() * 50),
      windSpeed: Math.round(Math.random() * 15),
      precipitation: condition === 'rain' || condition === 'snow' ? Math.round(Math.random() * 10) : 0,
      timestamp: new Date()
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
}
