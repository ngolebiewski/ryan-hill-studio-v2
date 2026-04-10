<script setup>
// Fetch the entire series list to build the hierarchy
const { data: allSeries } = await useFetch('/api/series')

// Organize series into a tree structure: Parents vs Children
const navTree = computed(() => {
  if (!allSeries.value) return []
  
  // 1. Filter for top-level items (those with no parent_id)
  return allSeries.value
    .filter(s => !s.parent_id)
    .map(parent => ({
      ...parent,
      // 2. Attach any series that identifies this one as its parent
      children: allSeries.value.filter(child => child.parent_id === parent.id)
    }))
})
</script>

<template>
  <div class="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm px-6 py-8 md:px-12 flex flex-col md:flex-row items-baseline justify-between gap-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-xl font-light tracking-[0.2em] uppercase">
          Ryan Hill Studio
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
        <div v-for="item in navTree" :key="item.id" class="relative group">
          <NuxtLink 
            :to="`/series/${item.slug}`" 
            class="nav-link flex items-center gap-1"
          >
            {{ item.title }}
            <span v-if="item.children.length" class="text-[7px] opacity-40 transition-transform group-hover:rotate-180">▼</span>
          </NuxtLink>

          <div v-if="item.children.length" class="absolute -left-4 top-full pt-4 hidden group-hover:block z-50">
            <div class="bg-white border border-zinc-100 p-4 min-w-[160px] flex flex-col gap-3 shadow-xl">
              <NuxtLink
                v-for="child in item.children"
                :key="child.id"
                :to="`/series/${child.slug}`"
                class="nav-link whitespace-nowrap"
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>
        </div>

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

/* Active link state for both static and dynamic routes */
.router-link-active:not([href="/"]) {
  @apply text-zinc-500;
}
</style>