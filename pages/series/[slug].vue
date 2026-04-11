<script setup>
import MarkdownIt from 'markdown-it'

const route = useRoute()
const md = new MarkdownIt()

const { data, error, pending } = await useFetch(`/api/series/${route.params.slug}`, {
  key: `series-${route.params.slug}`
})

// Sort artworks by order_index
const sortedArtworks = computed(() => {
  if (!data.value?.artworks) return []
  return [...data.value.artworks].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
})

// Use markdown-it to render the series description
const renderedDescription = computed(() => {
  return data.value?.series?.description ? md.render(data.value.series.description) : ''
})
</script>

<template>
  <div class="py-4">
    <div v-if="pending" class="p-12 text-xs uppercase tracking-widest animate-pulse">
      Loading...
    </div>

    <div v-else-if="error" class="p-12 text-red-500">
      Error: {{ error.statusMessage || 'Could not load series' }}
    </div>

    <div v-else-if="data" class="space-y-12">
      <h1 class="text-xl font-light tracking-[0.2em] uppercase px-4">
        {{ data.series?.title }}
      </h1>

      <div class="flex flex-col gap-12 md:hidden px-4">
        <div v-if="renderedDescription" 
             class="series-description prose prose-zinc text-zinc-500 uppercase tracking-widest text-[10px] leading-relaxed"
             v-html="renderedDescription">
        </div>

        <NuxtLink
          v-for="art in sortedArtworks"
          :key="art.id"
          :to="`/artwork/${art.slug}`"
        >
          <img :src="art.image_url" class="w-full h-auto" :alt="art.title" />
          <p class="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">{{ art.title }}</p>
        </NuxtLink>
      </div>

      <div class="hidden md:flex gap-12 overflow-x-auto pb-12 px-12 snap-x items-center">
        
        <div v-if="renderedDescription" 
             class="flex-shrink-0 snap-start w-[400px] h-[60vh] flex flex-col justify-center pr-12 border-r border-zinc-100">
          <div class="series-description text-zinc-400 uppercase tracking-[0.2em] text-[11px] leading-loose"
               v-html="renderedDescription">
          </div>
        </div>

        <NuxtLink
          v-for="art in sortedArtworks"
          :key="art.id"
          :to="`/artwork/${art.slug}`"
          class="flex-shrink-0 snap-center"
        >
          <img
            :src="art.image_url"
            class="h-[75vh] w-auto object-contain bg-zinc-50"
            :alt="art.title"
          />
          <p class="mt-4 text-[10px] uppercase tracking-widest text-zinc-400">{{ art.title }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gallery Description Context */
.series-description :deep(p) {
  margin-bottom: 2rem;
}

.series-description :deep(strong) {
  color: #18181b; /* zinc-900 */
  font-weight: 700;
}

/* Accessible & Stylized Links */
.series-description :deep(a) {
  color: #3f3f46; /* zinc-700 - slightly darker than the prose for contrast */
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  transition: all 0.2s ease;
}

.series-description :deep(a:hover) {
  color: #000000;
  text-decoration-thickness: 2px;
  background-color: #f4f4f5; /* zinc-100 subtle highlight */
}

.series-description :deep(a:focus) {
  outline: 2px solid #6366f1; /* indigo-500 for high-visibility focus */
  outline-offset: 4px;
}

/* Standard Gallery UI bits */
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>