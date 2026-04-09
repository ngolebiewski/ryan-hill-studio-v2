<script setup>
const route = useRoute()

// We use 'data' as the key to match your template
const { data, error, pending } = await useFetch(`/api/series/${route.params.slug}`, {
  key: `series-${route.params.slug}` // Ensures unique cache per series
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
        <NuxtLink
          v-for="art in data.artworks"
          :key="art.id"
          :to="`/artworks/${art.slug}`"
        >
          <img :src="art.image_url" class="w-full h-auto" :alt="art.title" />
          <p class="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">{{ art.title }}</p>
        </NuxtLink>
      </div>

      <div class="hidden md:flex gap-12 overflow-x-auto pb-12 px-12 snap-x">
        <NuxtLink
          v-for="art in data.artworks"
          :key="art.id"
          :to="`/artworks/${art.slug}`"
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

    <div v-else class="p-12 border-t mt-12 text-xs font-mono text-zinc-400">
      Data is null. Current Slug: {{ route.params.slug }}
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>