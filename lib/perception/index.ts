import { EmbeddingService } from './embedding'
import { ClientSidePerception } from './client-side'
import { PerceptionConfig, ImageAnalysis, DuplicateDetection } from './types'
import { getDatabase } from '../db'

export class PerceptionAgent {
  private embeddingService: EmbeddingService
  private clientSidePerception: ClientSidePerception
  private config: PerceptionConfig

  constructor(config?: Partial<PerceptionConfig>) {
    this.config = {
      enableClientSide: process.env.PRIVACY_LOCAL_FIRST === 'true',
      enableServerSide: true,
      embeddingModel: 'clip-vit-base-patch32',
      similarityThreshold: 0.8,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      ...config
    }

    this.embeddingService = new EmbeddingService(this.config)
    this.clientSidePerception = new ClientSidePerception()
  }

  async processUpload(file: File, userId: string): Promise<{
    analysis: ImageAnalysis
    duplicateDetection: DuplicateDetection
    shouldUpload: boolean
  }> {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error('File too large')
    }

    let analysis: ImageAnalysis

    // Try client-side analysis first if enabled
    if (this.config.enableClientSide) {
      const localAnalysis = await this.clientSidePerception.analyzeImageLocally(file)
      if (localAnalysis) {
        analysis = localAnalysis
      } else {
        analysis = await this.embeddingService.analyzeImage(URL.createObjectURL(file))
      }
    } else {
      analysis = await this.embeddingService.analyzeImage(URL.createObjectURL(file))
    }

    // Check for duplicates
    const duplicateDetection = await this.detectDuplicates(analysis, userId)

    // Determine if we should upload the full image
    const shouldUpload = !this.config.enableClientSide || !duplicateDetection.isDuplicate

    return {
      analysis,
      duplicateDetection,
      shouldUpload
    }
  }

  private async detectDuplicates(analysis: ImageAnalysis, userId: string): Promise<DuplicateDetection> {
    if (!analysis.embedding || analysis.embedding.length === 0) {
      return {
        isDuplicate: false,
        similarItems: [],
        confidence: 0
      }
    }

    try {
      const db = await getDatabase()
      const similarItems = await db.findSimilarItems({
        embedding: analysis.embedding,
        threshold: this.config.similarityThreshold,
        limit: 5
      })

      const duplicates = similarItems
        .filter(item => item.userId === userId)
        .map(item => ({
          id: item.id,
          similarity: this.embeddingService.calculateSimilarity(
            analysis.embedding!,
            item.embedding || []
          ),
          perceptualHash: analysis.perceptualHash || ''
        }))
        .filter(item => item.similarity > this.config.similarityThreshold)

      return {
        isDuplicate: duplicates.length > 0,
        similarItems: duplicates,
        confidence: duplicates.length > 0 ? Math.max(...duplicates.map(d => d.similarity)) : 0
      }
    } catch (error) {
      console.warn('Duplicate detection failed:', error)
      return {
        isDuplicate: false,
        similarItems: [],
        confidence: 0
      }
    }
  }

  async enrichItem(itemId: string, userId: string): Promise<void> {
    try {
      const db = await getDatabase()
      const item = await db.getItem(itemId)
      
      if (!item || item.userId !== userId) {
        throw new Error('Item not found or access denied')
      }

      // Re-analyze with latest models
      const analysis = await this.embeddingService.analyzeImage(item.imageUrl)
      
      // Update item with enriched data
      await db.updateItem(itemId, {
        colors: analysis.colors,
        patterns: analysis.patterns,
        fabric: analysis.fabric,
        formality: analysis.formality,
        embedding: analysis.embedding
      })
    } catch (error) {
      console.warn('Item enrichment failed:', error)
    }
  }

  getClientCapabilities() {
    return this.clientSidePerception.getCapabilities()
  }
}

export { EmbeddingService } from './embedding'
export { ClientSidePerception } from './client-side'
export * from './types'
