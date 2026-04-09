// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  // 1. Fetch user (Normalize email to lowercase)
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
    [email.toLowerCase()],
  );
  const user = result.rows[0];

  // 2. Verify
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  // 3. Create Token
  const token = await createToken(user);

  // 4. Set Cookie
  // setCookie(event, 'admin_token', token, {
  //     httpOnly: true, // Prevents JS access (Security)
  //     // secure: process.env.NODE_ENV === 'production',
  //     secure: false, // Temporary: force false for testing
  //     sameSite: 'lax',
  //     path: '/',      // CRITICAL: Makes cookie available to /admin and /api
  //     maxAge: 60 * 60 * 24 // 1 day
  // })
  // server/api/auth/login.post.ts
  setCookie(event, "admin_token", token, {
    httpOnly: true,
    path: "/", // Matches everything from root
    secure: false, // Critical for localhost:3000
    sameSite: "lax", // Allows the cookie to be sent on top-level navigations
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
});
