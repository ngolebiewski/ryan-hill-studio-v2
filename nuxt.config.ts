export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss', // Put this back for stability
    '@nuxthq/ui'
  ],
  // This tells Tailwind to look in the root since you aren't using /app
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  runtimeConfig: {
    databaseUrl: '',
    jwtSecret: '',  
  },
  ssr: true // Enable SSR for proper auth hydration
})