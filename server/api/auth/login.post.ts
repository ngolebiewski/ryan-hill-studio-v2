// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  console.log('🔐 [LOGIN] POST /api/auth/login')
  const body = await readBody(event);
  const { email, password } = body;
  console.log('🔐 [LOGIN] Email provided:', email)

  // 1. Fetch user (Normalize email to lowercase)
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
    [email.toLowerCase()],
  );
  const user = result.rows[0];
  console.log('🔐 [LOGIN] User found:', user ? user.email : 'NOT FOUND')

  // 2. Verify
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    console.log('🔐 [LOGIN] Password verification FAILED')
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }
  console.log('🔐 [LOGIN] Password verified successfully')

  // 3. Create Token
  const token = await createToken(user);
  console.log('🔐 [LOGIN] Token created:', token.substring(0, 20) + '...')

  // 4. Set Cookie
  setCookie(event, "admin_token", token, {
    httpOnly: true,
    path: "/", // Matches everything from root
    secure: false, // Critical for localhost:3000
    sameSite: "lax", // Allows the cookie to be sent on top-level navigations
    maxAge: 60 * 60 * 24, // 24 hours
  });
  console.log('🔐 [LOGIN] Cookie set: admin_token')

  return { success: true };
});
