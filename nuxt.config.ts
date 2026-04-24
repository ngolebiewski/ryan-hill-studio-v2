export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss", // Put this back for stability
    "@nuxthq/ui",
    "@nuxt/image",
  ],
  // This tells Tailwind to look in the root since you aren't using /app
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  image: {
    domains: [
      "localhost:3000",
      "localhost:8888",
      "ryanhillstudiov2.netlify.app",
      "ryanhill.studio",
      "img.youtube.com", // YouTube thumbnails
      "**", // Catch-all for any other external URLs
    ],
    providers: {
      netlify: {
        baseURL:
          process.env.NODE_ENV === "production"
            ? "https://ryanhill.studio/api/artworks/blob"
            : "https://ryanhillstudiov2.netlify.app/api/artworks/blob",
      },
    },
  },
  runtimeConfig: {
    databaseUrl: "",
    jwtSecret: "",
  },
  ssr: true, // Enable SSR for proper auth hydration
});
