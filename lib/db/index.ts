import { DatabaseAdapter } from './interface'
import { LocalFallbackAdapter } from './local-fallback'
import { DatabaseConfig } from './types'

let dbInstance: DatabaseAdapter | null = null

export async function getDatabase(config?: DatabaseConfig): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance

  const dbConfig = config || {
    url: process.env.DATABASE_URL,
    vectorDbOpts: {
      dimension: 384,
      indexType: 'ivfflat'
    },
    fallbackMode: !process.env.DATABASE_URL
  }

  if (dbConfig.fallbackMode || !dbConfig.url) {
    console.log('Using local fallback database')
    dbInstance = new LocalFallbackAdapter()
  } else {
    // TODO: Implement PostgresAdapter with pgvector
    console.log('Postgres adapter not implemented, falling back to local')
    dbInstance = new LocalFallbackAdapter()
  }

  await dbInstance.migrate()
  return dbInstance
}

export { DatabaseAdapter } from './interface'
export { LocalFallbackAdapter } from './local-fallback'
export * from './types'
