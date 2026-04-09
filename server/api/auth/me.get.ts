export default defineEventHandler(async (event) => {
  try {
    // checkAuth is the helper we wrote in server/utils/auth.ts
    // We manually trigger it here to verify the cookie
    await checkAuth(event)
    return event.context.user // Return the decrypted JWT payload (id, email, etc.)
  } catch (e) {
    return null // Not logged in
  }
})