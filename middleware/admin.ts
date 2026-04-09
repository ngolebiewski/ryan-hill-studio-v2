// middleware/admin.ts
export default defineNuxtRouteMiddleware(async (to) => {
  console.log('🔐 [MIDDLEWARE] Admin middleware triggered for:', to.path)
  
  // Skip middleware on login page - let users access the gate
  if (to.path === '/admin/gate') {
    console.log('🔐 [MIDDLEWARE] Gate page - allowing access')
    return
  }

  // For all other admin routes, verify authentication
  // Call the /api/auth/me endpoint which validates the cookie
  try {
    console.log('🔐 [MIDDLEWARE] Checking auth by calling /api/auth/me')
    const response = await $fetch('/api/auth/me')
    console.log('🔐 [MIDDLEWARE] Auth response:', response)
    // If we got a user back, auth is valid - allow access
    if (response) {
      console.log('🔐 [MIDDLEWARE] Auth valid - allowing access for:', response.email)
      return
    }
  } catch (err) {
    // Auth check failed, redirect to gate
    console.log('🔐 [MIDDLEWARE] Auth check failed:', err)
  }

  // No valid auth, redirect to gate
  console.log('🔐 [MIDDLEWARE] No valid auth - redirecting to /admin/gate')
  return navigateTo('/admin/gate')
})