// server/utils/db.ts
import pg from 'pg'
const { Pool } = pg

const config = useRuntimeConfig()

// LOG THIS to your terminal to see where Nuxt is actually looking
console.log('Connecting to:', config.databaseUrl)

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
})