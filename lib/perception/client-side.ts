import { ImageAnalysis, ClientSideCapabilities } from './types'

export class ClientSidePerception {
  private capabilities: ClientSideCapabilities

  constructor() {
    this.capabilities = this.detectCapabilities()
  }

  private detectCapabilities(): ClientSideCapabilities {
    return {
      hasCLIP: this.checkCLIPSupport(),
      hasImageProcessing: this.checkImageProcessingSupport(),
      hasLocalStorage: typeof Storage !== 'undefined'
    }
  }

  private checkCLIPSupport(): boolean {
    // Check if CLIP or similar model is available
    // This would typically check for WebAssembly support, model availability, etc.
    return false // Disabled for now
  }

  private checkImageProcessingSupport(): boolean {
    // Check for Canvas API and basic image processing capabilities
    return typeof document !== 'undefined' && 
           typeof HTMLCanvasElement !== 'undefined' &&
           typeof ImageData !== 'undefined'
  }

  async analyzeImageLocally(file: File): Promise<ImageAnalysis | null> {
    if (!this.capabilities.hasImageProcessing) {
      return null
    }

    try {
      // Basic image analysis using Canvas API
      const analysis = await this.performBasicAnalysis(file)
      return analysis
    } catch (error) {
      console.warn('Local image analysis failed:', error)
      return null
    }
  }

  private async performBasicAnalysis(file: File): Promise<ImageAnalysis> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const colors = this.extractDominantColors(imageData)
          const perceptualHash = this.generatePerceptualHash(imageData)

          resolve({
            colors,
            patterns: ['solid'], // Basic fallback
            fabric: 'unknown',
            category: 'unknown',
            formality: 'casual',
            confidence: 0.3, // Low confidence for basic analysis
            embedding: [],
            perceptualHash
          })
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  private extractDominantColors(imageData: ImageData): string[] {
    const data = imageData.data
    const colorCounts = new Map<string, number>()
    const step = 4 // Sample every 4th pixel for performance

    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Quantize colors to reduce noise
      const quantizedR = Math.round(r / 32) * 32
      const quantizedG = Math.round(g / 32) * 32
      const quantizedB = Math.round(b / 32) * 32
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1)
    }

    // Return top 3 colors
    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => this.rgbToColorName(color))
  }

  private rgbToColorName(rgb: string): string {
    const [r, g, b] = rgb.split(',').map(Number)
    
    // Simple color classification
    if (r > 200 && g > 200 && b > 200) return 'white'
    if (r < 50 && g < 50 && b < 50) return 'black'
    if (r > g && r > b) return 'red'
    if (g > r && g > b) return 'green'
    if (b > r && b > g) return 'blue'
    if (r > 150 && g > 150 && b < 100) return 'yellow'
    if (r > 150 && g < 100 && b > 150) return 'purple'
    if (r > 150 && g < 150 && b < 150) return 'pink'
    if (r > 100 && g > 100 && b < 100) return 'orange'
    if (r > 100 && g > 50 && b < 50) return 'brown'
    
    return 'gray'
  }

  private generatePerceptualHash(imageData: ImageData): string {
    // Simple perceptual hash based on average brightness
    const data = imageData.data
    let sum = 0
    let count = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      sum += (r + g + b) / 3
      count++
    }

    const average = sum / count
    return Math.round(average).toString(16).padStart(2, '0')
  }

  getCapabilities(): ClientSideCapabilities {
    return this.capabilities
  }
}
