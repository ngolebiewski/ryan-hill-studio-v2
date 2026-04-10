export default defineEventHandler((event) => {
  console.log('🔐 [LOGOUT] POST /api/auth/logout')
  deleteCookie(event, 'admin_token', { path: '/' })
  console.log('🔐 [LOGOUT] Cookie deleted: admin_token')
  return { success: true }
})