export default defineEventHandler(async (event) => {
  console.log('🔐 [/api/auth/me] GET /api/auth/me')
  try {
    // checkAuth is the helper we wrote in server/utils/auth.ts
    // We manually trigger it here to verify the cookie
    await checkAuth(event)
    console.log('🔐 [/api/auth/me] Auth check passed, returning user:', event.context.user.email)
    return event.context.user // Return the decrypted JWT payload (id, email, etc.)
  } catch (e: any) {
    console.log('🔐 [/api/auth/me] Auth check failed:', e.message)
    return null // Not logged in
  }
})