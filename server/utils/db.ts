import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString: useRuntimeConfig().databaseUrl
})
