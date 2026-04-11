// server/middleware/admin-auth.ts
// This middleware runs on the SERVER and checks if the user is authenticated BEFORE rendering or modifying data
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  const method = event.method
  
  console.log(`🔐 [SERVER ADMIN AUTH] Processing ${method} ${path}`)
  
  // 1. Define Protected Zones
  const isAdminPage = path.startsWith('/admin') && !path.startsWith('/admin/gate')
  // Protect API mutations (POST, PUT, DELETE) but allow GET for public viewing
  const isProtectedApi = (path.startsWith('/api/series') || path.startsWith('/api/artworks') || path.startsWith('/api/admin')) && method !== 'GET'

  // If it's not a protected admin page or a protected API call, let it through
  if (!isAdminPage && !isProtectedApi) {
    // Log specifically for the gate to keep your current debug flow
    if (path.startsWith('/admin/gate')) {
      console.log(`🔐 [SERVER ADMIN AUTH] Gate page - allowing unauthenticated access`)
    }
    return
  }

  console.log(`🔐 [SERVER ADMIN AUTH] Protected route detected (${method} ${path}) - checking authentication`)

  // Check if user has valid auth cookie
  const token = getCookie(event, 'admin_token')
  console.log(`🔐 [SERVER ADMIN AUTH] Token in cookie:`, token ? `YES (${token.substring(0, 30)}...)` : 'NO')

  if (!token) {
    console.log(`🔐 [SERVER ADMIN AUTH] ❌ No token found`)
    
    // API routes should return a 401 error, Pages should redirect to the gate
    if (path.startsWith('/api/')) {
      console.log(`🔐 [SERVER ADMIN AUTH] Returning 401 Unauthorized for API`)
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    
    console.log(`🔐 [SERVER ADMIN AUTH] Redirecting Page to /admin/gate`)
    return sendRedirect(event, '/admin/gate', 302)
  }

  // Verify the token is valid
  try {
    const config = useRuntimeConfig()
    const JWT_SECRET = new TextEncoder().encode(config.jwtSecret)
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    console.log(`🔐 [SERVER ADMIN AUTH] ✅ Token verified successfully`)
    console.log(`🔐 [SERVER ADMIN AUTH] User: ${payload.email}, Admin: ${payload.admin}`)
    
    // Token is valid, attach to context and allow the request to proceed
    event.context.user = payload
  } catch (err) {
    console.log(`🔐 [SERVER ADMIN AUTH] ❌ Token verification failed: ${(err as Error).message}`)
    
    if (path.startsWith('/api/')) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid Session' })
    }
    
    return sendRedirect(event, '/admin/gate', 302)
  }
})