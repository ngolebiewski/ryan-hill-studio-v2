// middleware/admin.ts
// NOTE: Server middleware (server/middleware/admin-auth.ts) handles ALL auth protection
// This client middleware is kept for UX during client-side navigation only
// It runs AFTER hydration during route changes

export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side, not during SSR
  if (process.server) return

  console.log('🔐 [CLIENT MIDDLEWARE] Route change detected:', to.path)
  
  // Skip check on login page
  if (to.path === '/admin/gate') {
    console.log('🔐 [CLIENT MIDDLEWARE] Gate page - allowing access')
    return
  }

  // For admin routes, verify token exists in cookie (lightweight client-side check)
  const token = useCookie('admin_token')
  console.log('🔐 [CLIENT MIDDLEWARE] Token in cookie:', token.value ? 'YES' : 'NO')
  
  if (!token.value) {
    console.log('🔐 [CLIENT MIDDLEWARE] No token - redirecting to /admin/gate')
    return navigateTo('/admin/gate')
  }

  console.log('🔐 [CLIENT MIDDLEWARE] Token found - allowing access')
})