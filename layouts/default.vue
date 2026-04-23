<script setup>
// Fetch the entire series list to build the hierarchy
const { data: allSeries } = await useFetch('/api/series')

const isMenuOpen = ref(false)
const route = useRoute()

// Organize series into a tree structure
const navTree = computed(() => {
  if (!allSeries.value) return []
  return allSeries.value
    .filter(s => !s.parent_id)
    .map(parent => ({
      ...parent,
      children: allSeries.value.filter(child => child.parent_id === parent.id)
    }))
})

// Close the mobile menu whenever the route changes
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
    <header 
      class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm px-6 py-6 md:px-12 md:py-10 border-b border-transparent transition-colors duration-300" 
      :class="{'border-zinc-100': isMenuOpen}"
    >
      <div class="flex items-center justify-between">
        
        <div class="flex items-center gap-3 md:gap-4">
          <NuxtLink to="/" class="text-lg md:text-xl font-light tracking-[0.2em] uppercase whitespace-nowrap">
            Ryan Hill Studio
          </NuxtLink>
          
          <a 
            href="https://www.instagram.com/ryanhillstudios/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="hover:opacity-60 transition-opacity flex items-center"
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>

        <button 
          @click="isMenuOpen = !isMenuOpen" 
          class="md:hidden p-2 focus:outline-none z-50 ml-auto"
          aria-label="Toggle Menu"
        >
          <div class="w-6 h-3 relative flex flex-col justify-between">
            <span class="w-full h-[1px] bg-zinc-900 transition-all duration-300" :class="{'rotate-45 translate-y-[5.5px]': isMenuOpen}"></span>
            <span class="w-full h-[1px] bg-zinc-900 transition-all duration-300" :class="{'opacity-0': isMenuOpen}"></span>
            <span class="w-full h-[1px] bg-zinc-900 transition-all duration-300" :class="{'-rotate-45 -translate-y-[5.5px]': isMenuOpen}"></span>
          </div>
        </button>

        <nav class="hidden md:flex items-center gap-x-8 text-[10px] uppercase tracking-[0.25em] font-medium">
          <div v-for="item in navTree" :key="item.id" class="relative group">
            <NuxtLink :to="`/series/${item.slug}`" class="nav-link flex items-center gap-1">
              {{ item.title }}
              <span v-if="item.children.length" class="text-[7px] opacity-40 transition-transform group-hover:rotate-180">▼</span>
            </NuxtLink>

            <div v-if="item.children.length" class="absolute -left-4 top-full pt-4 hidden group-hover:block z-50">
              <div class="bg-white border border-zinc-100 p-4 min-w-[160px] flex flex-col gap-3 shadow-xl">
                <NuxtLink v-for="child in item.children" :key="child.id" :to="`/series/${child.slug}`" class="nav-link whitespace-nowrap">
                  {{ child.title }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <NuxtLink to="/about" class="nav-link">About / Bio</NuxtLink>
          <NuxtLink to="/cv" class="nav-link">CV</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>

      <transition 
        enter-active-class="transition duration-300 ease-out" 
        enter-from-class="opacity-0 -translate-y-4" 
        enter-to-class="opacity-100 translate-y-0" 
        leave-active-class="transition duration-200 ease-in" 
        leave-from-class="opacity-100 translate-y-0" 
        leave-to-class="opacity-0 -translate-y-4"
      >
        <nav v-if="isMenuOpen" class="md:hidden flex flex-col gap-8 pt-12 pb-10 text-[11px] uppercase tracking-[0.3em] font-medium">
          <div v-for="item in navTree" :key="item.id" class="flex flex-col gap-4">
            <NuxtLink :to="`/series/${item.slug}`" class="text-zinc-900">{{ item.title }}</NuxtLink>
            <div v-if="item.children.length" class="pl-4 flex flex-col gap-4 border-l border-zinc-100">
              <NuxtLink v-for="child in item.children" :key="child.id" :to="`/series/${child.slug}`" class="text-zinc-400">
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>
          <NuxtLink to="/about" class="nav-link">About / Bio</NuxtLink>
          <NuxtLink to="/cv" class="nav-link">CV</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </transition>
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

.md\:flex .router-link-active:not([href="/"]) {
  @apply text-zinc-500;
}

.md\:hidden .router-link-active:not([href="/"]) {
  @apply text-zinc-900 border-b border-zinc-900 w-fit pb-1;
}
</style>