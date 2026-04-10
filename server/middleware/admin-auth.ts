// server/middleware/admin-auth.ts
// This middleware runs on the SERVER and checks if the user is authenticated BEFORE rendering
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  
  console.log(`🔐 [SERVER ADMIN AUTH] Processing ${event.method} ${path}`)
  
  // Only process /admin routes (but NOT /admin/gate)
  if (!path.startsWith('/admin')) {
    return
  }
  
  // Always allow access to the gate (login page)
  if (path.startsWith('/admin/gate')) {
    console.log(`🔐 [SERVER ADMIN AUTH] Gate page - allowing unauthenticated access`)
    return
  }

  console.log(`🔐 [SERVER ADMIN AUTH] Protected admin route - checking authentication`)

  // Check if user has valid auth cookie
  const token = getCookie(event, 'admin_token')
  console.log(`🔐 [SERVER ADMIN AUTH] Token in cookie:`, token ? `YES (${token.substring(0, 30)}...)` : 'NO')

  if (!token) {
    console.log(`🔐 [SERVER ADMIN AUTH] ❌ No token found - redirecting to /admin/gate`)
    return sendRedirect(event, '/admin/gate', 302)
  }

  // Verify the token is valid
  try {
    const config = useRuntimeConfig()
    const JWT_SECRET = new TextEncoder().encode(config.jwtSecret)
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    console.log(`🔐 [SERVER ADMIN AUTH] ✅ Token verified successfully`)
    console.log(`🔐 [SERVER ADMIN AUTH] User: ${payload.email}, Admin: ${payload.admin}`)
    
    // Token is valid, attach to context and allow page to render
    event.context.user = payload
  } catch (err) {
    console.log(`🔐 [SERVER ADMIN AUTH] ❌ Token verification failed: ${(err as Error).message}`)
    // Token is invalid, redirect to gate
    return sendRedirect(event, '/admin/gate', 302)
  }
})
