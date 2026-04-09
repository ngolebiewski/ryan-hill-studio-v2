// middleware/admin.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on login page - let users access the gate
  if (to.path === '/admin/gate') {
    return
  }

  // For all other admin routes, verify authentication
  // Call the /api/auth/me endpoint which validates the cookie
  try {
    const response = await $fetch('/api/auth/me')
    // If we got a user back, auth is valid - allow access
    if (response) {
      return
    }
  } catch (err) {
    // Auth check failed, redirect to gate
  }

  // No valid auth, redirect to gate
  return navigateTo('/admin/gate')
})