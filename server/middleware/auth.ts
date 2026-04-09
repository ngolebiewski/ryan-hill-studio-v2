// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  const method = event.method // Get the HTTP method (GET, POST, etc.)

  // 1. Only run on API routes
  // 2. Ignore the login route
  // 3. IGNORE ALL GET REQUESTS (This keeps your portfolio public)
  if (
    path.startsWith('/api/') && 
    !path.startsWith('/api/auth/') &&
    method !== 'GET'
  ) {
    await checkAuth(event)
  }
})