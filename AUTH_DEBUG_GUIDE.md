# Auth Debug Guide - Cookie/Hydration Issue Fix

## Problem Fixed
The admin pages were experiencing hydration issues causing the page to appear briefly then disappear. This was caused by:
1. SSR being disabled for admin routes (`ssr: false`)
2. Conditional rendering mismatch between server and client
3. No server-side auth check before page rendering

## Solution Implemented
1. **Enabled SSR** globally in `nuxt.config.ts`
2. **Added server middleware** (`server/middleware/admin-auth.ts`) that checks auth BEFORE rendering
3. **Removed conditional rendering** in page components
4. **Added comprehensive logging** throughout the auth flow

## How the New Auth Flow Works

```
LOGIN: /admin/gate
  ↓
POST /api/auth/login
  ├─ Verify user in database
  ├─ Create JWT token
  ├─ Set admin_token cookie
  └─ Response: { success: true }
  ↓
window.location.href = '/admin' (hard redirect, preserves cookie)
  ↓
SERVER MIDDLEWARE (admin-auth.ts) runs FIRST
  ├─ Reads admin_token cookie
  ├─ Verifies JWT signature
  ├─ If valid: allows page to render
  └─ If invalid: redirects to /admin/gate BEFORE sending HTML
  ↓
SERVER RENDERS /admin page (SSR)
  ├─ Page component calls useFetch('/api/auth/me')
  ├─ GET /api/auth/me validates cookie and returns user
  └─ Page renders with user data
  ↓
CLIENT HYDRATION
  ├─ Server HTML matches client expectations (no mismatch!)
  └─ Page displays admin dashboard
  ↓
CLIENT NAVIGATION (client-side route changes)
  ├─ admin.ts middleware validates via /api/auth/me
  └─ Acts as fallback to server middleware
```

## Testing Instructions

### 1. Prerequisites: Create a test user in your local database

You need to insert a user record with an argon2-hashed password. Run this SQL in your local PostgreSQL:

```sql
-- First, use Node.js to hash your password
-- In Node REPL: 
-- const argon2 = require('argon2');
-- await argon2.hash('your_password_here')

-- Then insert the user:
INSERT INTO users (email, password_hash, is_admin, artist_name)
VALUES (
  'test@example.com',
  '$argon2id$v=19$m=65536,t=3,p=4$...', -- Your hashed password here
  true,
  'Test User'
);
```

Or create a quick Node script to hash and insert:

```javascript
// hash-password.js
import argon2 from 'argon2';
import pg from 'pg';

const password = process.argv[2] || 'testpassword123';
const email = process.argv[3] || 'test@example.com';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

await pool.query(
  'INSERT INTO users (email, password_hash, is_admin, artist_name) VALUES ($1, $2, true, $3)',
  [email, hash, 'Admin User']
);

console.log(`✅ User created: ${email}`);
await pool.end();
```

Run with: `node hash-password.js "mypassword" "ryan@example.com"`

### 2. Start the dev server

```bash
npm run dev
```

### 3. Open the browser console

Open DevTools (F12) and go to the **Console** tab. You should see logs with 🔐 emoji showing the auth flow.

### 4. Test the login flow

1. Navigate to `http://localhost:3000/admin/gate`
2. Enter your test email and password
3. Click "Enter"
4. **Watch the console logs** - you should see:

```
🔐 [GATE] Login attempt
🔐 [GATE] Email: test@example.com
🔐 [GATE] Calling /api/auth/login
🔐 [GATE] Login response received, redirecting to /admin
```

### 5. Check the server logs

In your terminal running `npm run dev`, you should see **in the server output**:

```
🔐 [LOGIN] POST /api/auth/login
🔐 [LOGIN] Email provided: test@example.com
🔐 [LOGIN] User found: test@example.com
🔐 [LOGIN] Password verified successfully
🔐 [LOGIN] Token created: eyJhbGciOiJIUz...
🔐 [LOGIN] Cookie set: admin_token

🔐 [SERVER ADMIN AUTH] Processing GET /admin
🔐 [SERVER ADMIN AUTH] Protected admin route - checking authentication
🔐 [SERVER ADMIN AUTH] Token in cookie: YES (...)
🔐 [SERVER ADMIN AUTH] ✅ Token verified successfully
🔐 [SERVER ADMIN AUTH] User: test@example.com, Admin: true

🔐 [ADMIN INDEX] Page script loading
🔐 [ADMIN INDEX] Calling useFetch for /api/auth/me

🔐 [/api/auth/me] GET /api/auth/me
🔐 [checkAuth] Starting auth check
🔐 [checkAuth] Authorization header: MISSING
🔐 [checkAuth] Token found: YES (...)
🔐 [checkAuth] All cookies: ...
🔐 [checkAuth] Token verified successfully for user: test@example.com
🔐 [/api/auth/me] Auth check passed, returning user: test@example.com
```

### 6. Verify you see the admin dashboard

You should now see the Studio Management page with three buttons:
- Manage Series
- Upload Artwork  
- Edit About/CV

And a "Logout / Clear Session" button at the bottom.

**If the page doesn't appear or redirects back to gate:** Check the server logs above for error messages.

## Debugging Checklist

- [ ] User exists in database with correct email
- [ ] User password hash is correctly generated
- [ ] `NUXT_DATABASE_URL` and `JWT_SECRET` are set in `.env`
- [ ] Database connection succeeds (check server logs on startup)
- [ ] No "Cannot find user" errors in login logs
- [ ] No JWT verification errors in server logs
- [ ] Cookie appears in browser DevTools > Application > Cookies
- [ ] Cookie is named "admin_token" and has httpOnly, sameSite=Lax, path=/
- [ ] Admin dashboard renders after login (no blank page)

## Files Changed

- ✅ `nuxt.config.ts` - Enabled SSR
- ✅ `server/middleware/admin-auth.ts` - NEW: Server-side auth middleware
- ✅ `middleware/admin.ts` - Client-side auth validation
- ✅ `pages/admin/index.vue` - Removed conditional rendering
- ✅ `pages/admin/gate.vue` - Added logging
- ✅ `server/api/auth/login.post.ts` - Added logging
- ✅ `server/api/auth/logout.post.ts` - Added logging
- ✅ `server/api/auth/me.get.ts` - Added logging
- ✅ `server/utils/auth.ts` - Added logging
- ✅ `server/middleware/auth.ts` - Added logging

## Expected Behavior After Fix

✅ User can log in with email + password
✅ Cookie is set and stored by browser
✅ User is redirected to /admin dashboard
✅ Admin dashboard displays without hydration errors
✅ User can logout and is redirected to gate
✅ Accessing /admin without auth redirects to gate
✅ Console shows detailed auth flow logs

## Still Having Issues?

1. **Share the server logs** - Copy all 🔐 logs from your terminal
2. **Share browser console logs** - Copy console output from DevTools  
3. **Check .env** - Make sure `JWT_SECRET` is set to something (at least 32 chars)
4. **Verify database** - Run `SELECT * FROM users;` to confirm user exists
5. **Clear browser storage** - Delete admin_token cookie and try again
6. **Restart server** - Kill dev server and `npm run dev` again
