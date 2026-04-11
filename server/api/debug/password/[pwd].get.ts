// // TEMPORARILY DEACTIVATE!


// import argon2 from 'argon2'

// export default defineEventHandler(async (event) => {
//   // Grab the password from the URL parameter
//   const password = getRouterParam(event, 'pwd')

//   if (!password) {
//     throw createError({
//       statusCode: 400,
//       statusMessage: 'Missing password in URL',
//     })
//   }

//   try {
//     // Generate the hash using the server's environment
//     const hash = await argon2.hash(password)
    
//     return {
//       message: "Hash generated successfully",
//       hash: hash
//     }
//   } catch (error: any) {
//     return {
//       error: "Argon2 hashing failed",
//       details: error.message
//     }
//   }
// })