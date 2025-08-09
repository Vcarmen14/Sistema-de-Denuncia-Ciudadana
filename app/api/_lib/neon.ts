import { neon } from "@neondatabase/serverless"

// Singleton Neon client
let _sql: ReturnType<typeof neon> | null = null

function getDatabaseUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  )
}

export function getSql() {
  if (_sql) return _sql
  const url = getDatabaseUrl()
  if (!url) {
    throw new Error("Database URL is not set. Define POSTGRES_URL or DATABASE_URL.")
  }
  _sql = neon(url)
  return _sql
}

// Normalize driver responses to array of rows
export function rows<T = any>(result: any): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && Array.isArray((result as any).rows)) return (result as any).rows as T[]
  return []
}

// Safe wrapper for .unsafe to avoid TS signature issues
async function unsafe<T = any>(text: string, params?: any[]): Promise<T[]> {
  const sql = getSql()
  const res = await (sql as any).unsafe(text, params)
  return rows<T>(res)
}

// Compatibility helper (text + params)
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  return unsafe<T>(text, params)
}
