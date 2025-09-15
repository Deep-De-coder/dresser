export interface AppConfig {
  database: {
    url?: string
    vectorDbOpts: {
      dimension: number
      indexType: string
    }
    fallbackMode: boolean
  }
  ai: {
    llmProviderKey?: string
    weatherApiKey?: string
    enableRealAI: boolean
  }
  privacy: {
    localFirstImages: boolean
    enableAnalytics: boolean
    dataRetentionDays: number
  }
  features: {
    enableCloudStorage: boolean
    enableSocialFeatures: boolean
    enableRealTimeCollaboration: boolean
  }
  rateLimiting: {
    requestsPerMinute: number
    burst: number
  }
  app: {
    url: string
    environment: string
  }
}

export function getConfig(): AppConfig {
  return {
    database: {
      url: process.env.DATABASE_URL,
      vectorDbOpts: {
        dimension: 384,
        indexType: 'ivfflat'
      },
      fallbackMode: !process.env.DATABASE_URL
    },
    ai: {
      llmProviderKey: process.env.LLM_PROVIDER_KEY,
      weatherApiKey: process.env.WEATHER_API_KEY,
      enableRealAI: process.env.ENABLE_REAL_AI === 'true'
    },
    privacy: {
      localFirstImages: process.env.PRIVACY_LOCAL_FIRST === 'true',
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '365')
    },
    features: {
      enableCloudStorage: process.env.ENABLE_CLOUD_STORAGE === 'true',
      enableSocialFeatures: process.env.ENABLE_SOCIAL_FEATURES === 'true',
      enableRealTimeCollaboration: process.env.ENABLE_REAL_TIME_COLLABORATION === 'true'
    },
    rateLimiting: {
      requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
      burst: parseInt(process.env.RATE_LIMIT_BURST || '10')
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      environment: process.env.NODE_ENV || 'development'
    }
  }
}

export function validateConfig(): { isValid: boolean; errors: string[] } {
  const config = getConfig()
  const errors: string[] = []

  // Check required configurations
  if (config.app.environment === 'production') {
    if (!config.database.url) {
      errors.push('DATABASE_URL is required in production')
    }
    if (!config.ai.weatherApiKey) {
      errors.push('WEATHER_API_KEY is required in production')
    }
  }

  // Validate numeric values
  if (config.privacy.dataRetentionDays < 1 || config.privacy.dataRetentionDays > 3650) {
    errors.push('DATA_RETENTION_DAYS must be between 1 and 3650')
  }

  if (config.rateLimiting.requestsPerMinute < 1 || config.rateLimiting.requestsPerMinute > 1000) {
    errors.push('RATE_LIMIT_REQUESTS_PER_MINUTE must be between 1 and 1000')
  }

  if (config.rateLimiting.burst < 1 || config.rateLimiting.burst > 100) {
    errors.push('RATE_LIMIT_BURST must be between 1 and 100')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getSafeDefaults(): Partial<AppConfig> {
  return {
    database: {
      fallbackMode: true,
      vectorDbOpts: {
        dimension: 384,
        indexType: 'ivfflat'
      }
    },
    ai: {
      enableRealAI: false
    },
    privacy: {
      localFirstImages: true,
      enableAnalytics: false,
      dataRetentionDays: 365
    },
    features: {
      enableCloudStorage: false,
      enableSocialFeatures: false,
      enableRealTimeCollaboration: false
    },
    rateLimiting: {
      requestsPerMinute: 60,
      burst: 10
    },
    app: {
      url: 'http://localhost:3000',
      environment: 'development'
    }
  }
}
