<script setup>
// Fetch the dynamic series list from our index endpoint
const { data: series } = await useFetch('/api/series')
</script>

<template>
  <div class="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm px-6 py-8 md:px-12 flex flex-col md:flex-row items-baseline justify-between gap-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-xl font-light tracking-[0.2em] uppercase">
          Ryan Hill STUDIO
        </NuxtLink>
        
        <a 
          href="https://www.instagram.com/ryanhillstudios/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="hover:opacity-60 transition-opacity"
          aria-label="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
      </div>

      <nav class="flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.25em] font-medium">
        <NuxtLink
          v-for="s in series || []"
          :key="s.id"
          :to="`/series/${s.slug}`"
          class="nav-link"
        >
          {{ s.title }}
        </NuxtLink>

        <NuxtLink to="/about" class="nav-link">About / Bio</NuxtLink>
        <NuxtLink to="/cv" class="nav-link">CV</NuxtLink>
        <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
      </nav>
    </header>

    <main class="px-6 md:px-12 pb-24">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.nav-link {
  @apply hover:text-zinc-400 transition-colors duration-300;
}

/* Custom Active State: Shows a subtle dot or underline */
.router-link-active:not([href="/"]) {
  @apply text-zinc-400;
}
</style>