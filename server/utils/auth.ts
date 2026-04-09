// server/utils/auth.ts
import { jwtVerify, SignJWT } from 'jose'
import argon2 from 'argon2'

// Use a fallback secret only in development; strictly require it in production
// const secretString = process.env.JWT_SECRET
// const JWT_SECRET = new TextEncoder().encode(secretString)
// This is the Nuxt-idiomatic way to get your secret
const config = useRuntimeConfig()
const JWT_SECRET = new TextEncoder().encode(config.jwtSecret)

/**
 * Hashes a plain text password using Argon2id.
 */
export const hashPassword = async (password: string) => {
  return await argon2.hash(password, { 
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 4
  })
}

/**
 * Verifies a password against an existing Argon2 hash.
 */
export const verifyPassword = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password)
  } catch (err) {
    return false
  }
}

/**
 * Signs a JWT for the admin user.
 */
// export const createToken = async (user: any) => {
//   return await new SignJWT({ 
//     id: user.id, 
//     email: user.email, 
//     admin: user.is_admin 
//   })
//     .setProtectedHeader({ alg: 'HS256' })
//     .setIssuedAt()
//     .setExpirationTime('24h')
//     .sign(JWT_SECRET)
// }
export const createToken = async (user: any) => {
  const config = useRuntimeConfig() // Ensure this is here
  const JWT_SECRET = new TextEncoder().encode(config.jwtSecret)

  return await new SignJWT({ id: user.id, email: user.email, admin: user.is_admin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}
/**
 * Validates the JWT from Cookies or Authorization headers.
 * Note: GET requests are already bypassed in the middleware.
 */
export const checkAuth = async (event: any) => {
  // Extract token from Bearer header OR the 'admin_token' cookie
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : getCookie(event, 'admin_token')

  if (!token) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Authentication required to modify content.' 
    })
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Attach user data to the event context for use in downstream handlers
    event.context.user = payload
  } catch (err) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Session expired or invalid. Please log in again.' 
    })
  }
}