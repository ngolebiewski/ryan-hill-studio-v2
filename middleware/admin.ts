// middleware/admin.ts
// NOTE: Server middleware (server/middleware/admin-auth.ts) is the primary auth guard
// This is kept as a safety net for logging only - no redirects
// (Redirects during hydration were causing the flickering issue)

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return
  
  console.log('🔐 [CLIENT MIDDLEWARE] Route:', to.path)
  const token = useCookie('admin_token')
  console.log('🔐 [CLIENT MIDDLEWARE] Token exists:', !!token.value)
  // Don't redirect here - let server handle it on next full page load
})