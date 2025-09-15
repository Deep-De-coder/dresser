import { PrivacySettings } from '../learning/types'

export class PrivacyGuardrails {
  private settings: Map<string, PrivacySettings> = new Map()

  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    if (this.settings.has(userId)) {
      return this.settings.get(userId)!
    }

    // Default privacy settings
    const defaultSettings: PrivacySettings = {
      userId,
      localFirstImages: process.env.PRIVACY_LOCAL_FIRST === 'true',
      shareAnalytics: false,
      storePersonalData: true,
      allowLearning: true,
      dataRetentionDays: 365,
      exportData: true,
      deleteData: true
    }

    this.settings.set(userId, defaultSettings)
    return defaultSettings
  }

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {
    const current = await this.getPrivacySettings(userId)
    const updated = { ...current, ...settings }
    this.settings.set(userId, updated)
  }

  async canStoreImage(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    return !settings.localFirstImages
  }

  async canStorePersonalData(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    return settings.storePersonalData
  }

  async canUseForLearning(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    return settings.allowLearning
  }

  async canShareAnalytics(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    return settings.shareAnalytics
  }

  async shouldRetainData(userId: string, createdAt: Date): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - settings.dataRetentionDays)
    return createdAt > retentionDate
  }

  async sanitizeDataForAnalytics(userId: string, data: any): Promise<any> {
    const settings = await this.getPrivacySettings(userId)
    
    if (!settings.shareAnalytics) {
      return null
    }

    // Remove personally identifiable information
    const sanitized = { ...data }
    delete sanitized.userId
    delete sanitized.email
    delete sanitized.name
    delete sanitized.imageUrl
    
    // Anonymize other data
    if (sanitized.items) {
      sanitized.items = sanitized.items.map((item: any) => ({
        category: item.category,
        colors: item.colors,
        formality: item.formality,
        // Remove item-specific identifiers
        id: this.hashId(item.id),
        title: this.anonymizeTitle(item.title)
      }))
    }

    return sanitized
  }

  async exportUserData(userId: string): Promise<any> {
    const settings = await this.getPrivacySettings(userId)
    
    if (!settings.exportData) {
      throw new Error('Data export not allowed')
    }

    // In real implementation, this would gather all user data
    return {
      userId,
      settings,
      exportDate: new Date(),
      dataTypes: ['items', 'outfits', 'feedback', 'preferences']
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    const settings = await this.getPrivacySettings(userId)
    
    if (!settings.deleteData) {
      throw new Error('Data deletion not allowed')
    }

    // In real implementation, this would delete all user data
    this.settings.delete(userId)
  }

  async validateDataAccess(userId: string, dataType: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId)
    
    switch (dataType) {
      case 'images':
        return await this.canStoreImage(userId)
      case 'personal':
        return await this.canStorePersonalData(userId)
      case 'learning':
        return await this.canUseForLearning(userId)
      case 'analytics':
        return await this.canShareAnalytics(userId)
      default:
        return true
    }
  }

  async getDataRetentionInfo(userId: string): Promise<{
    retentionDays: number
    canExport: boolean
    canDelete: boolean
    dataTypes: string[]
  }> {
    const settings = await this.getPrivacySettings(userId)
    
    return {
      retentionDays: settings.dataRetentionDays,
      canExport: settings.exportData,
      canDelete: settings.deleteData,
      dataTypes: ['items', 'outfits', 'feedback', 'preferences', 'images']
    }
  }

  private hashId(id: string): string {
    // Simple hash function for anonymization
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private anonymizeTitle(title: string): string {
    // Replace specific item names with generic categories
    const genericTitles = {
      'shirt': 'Shirt',
      'pants': 'Pants',
      'jacket': 'Jacket',
      'dress': 'Dress',
      'shoes': 'Shoes',
      'accessory': 'Accessory'
    }
    
    const lowerTitle = title.toLowerCase()
    for (const [category, generic] of Object.entries(genericTitles)) {
      if (lowerTitle.includes(category)) {
        return generic
      }
    }
    
    return 'Clothing Item'
  }

  async auditDataAccess(userId: string): Promise<{
    lastAccess: Date
    accessCount: number
    dataTypes: string[]
    retentionStatus: string
  }> {
    const settings = await this.getPrivacySettings(userId)
    
    return {
      lastAccess: new Date(),
      accessCount: 0, // Would be tracked in real implementation
      dataTypes: ['items', 'outfits', 'feedback'],
      retentionStatus: settings.dataRetentionDays > 0 ? 'active' : 'expired'
    }
  }
}
