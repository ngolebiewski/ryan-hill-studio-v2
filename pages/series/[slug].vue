<script setup>
import MarkdownIt from 'markdown-it'

const route = useRoute()
const md = new MarkdownIt()
const activeVideoId = ref(null)
const imageAspectRatios = ref({}) // Track aspect ratios
const imageLoadingStates = ref({}) // Track which images have loaded
const imageErrorStates = ref({}) // Track image load errors

const { data, error, pending } = await useFetch(`/api/series/${route.params.slug}`, {
  key: `series-${route.params.slug}`
})

const sortedArtworks = computed(() => {
  if (!data.value?.artworks) return []
  return [...data.value.artworks].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
})

const renderedDescription = computed(() => {
  return data.value?.series?.description ? md.render(data.value.series.description) : ''
})

const getEmbedUrl = (url) => {
  if (!url) return ''
  let id = ''
  if (url.includes('v=')) id = url.split('v=')[1].split('&')[0]
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
}

const getAspectRatio = (art) => {
  // Return stored ratio or default to 16/9 (horizontal)
  return imageAspectRatios.value[art.id] || 16 / 9
}

const isImageLoaded = (artId) => {
  return imageLoadingStates.value[artId] === true
}

const isImageError = (artId) => {
  return imageErrorStates.value[artId] === true
}

const onVideoLoadedMetadata = (event, artId) => {
  const video = event.target
  if (video.videoWidth && video.videoHeight) {
    imageAspectRatios.value[artId] = video.videoWidth / video.videoHeight
  }
}

const onImageLoad = (event, artId) => {
  const img = event.target
  if (img.naturalWidth && img.naturalHeight) {
    imageAspectRatios.value[artId] = img.naturalWidth / img.naturalHeight
  }
  // Mark image as loaded
  imageLoadingStates.value[artId] = true
}

const onImageError = (artId) => {
  // Mark image as errored
  imageErrorStates.value[artId] = true
  // Stop showing skeleton
  imageLoadingStates.value[artId] = true
}

const togglePlay = (id) => {
  activeVideoId.value = activeVideoId.value === id ? null : id
}

useHead({
  title: computed(() => data.value?.series?.title ? `${data.value.series.title} | Ryan Hill Studio` : 'Series'),
})
</script>

<template>
  <div class="py-4">
    <div v-if="pending" class="p-12 text-xs uppercase tracking-widest animate-pulse">Loading...</div>
    <div v-else-if="error" class="p-12 text-red-500">Error loading series</div>

    <div v-else-if="data" class="space-y-12">
      <h1 class="text-xl font-light tracking-[0.2em] uppercase px-4">{{ data.series?.title }}</h1>

      <div class="flex flex-col md:flex-row gap-12 md:overflow-x-auto pb-12 px-4 md:px-12 items-center md:snap-x">
        
        <div v-if="renderedDescription" 
             class="flex-shrink-0 md:snap-start w-full md:w-[400px] md:h-[60vh] flex flex-col justify-center md:pr-12 md:border-r border-zinc-100 mb-12 md:mb-0">
          <div class="series-description prose prose-zinc text-zinc-500 uppercase tracking-widest text-[10px] md:text-[11px] leading-relaxed"
               v-html="renderedDescription">
          </div>
        </div>

        <div v-for="art in sortedArtworks" :key="art.id" 
             class="flex-shrink-0 md:snap-center w-full md:w-auto relative group mb-16 md:mb-0">
          
          <!-- Image Container with Skeleton Placeholder -->
          <div class="relative w-full md:h-[75vh] flex items-center overflow-hidden"
               :style="{ aspectRatio: getAspectRatio(art) }">
            
            <!-- VIDEO VIEW -->
            <div v-if="activeVideoId === art.id" class="w-full h-full flex items-center justify-center bg-black"
                 :style="{ aspectRatio: getAspectRatio(art) }">
              <iframe 
                v-if="art.video_url?.includes('youtube') || art.video_url?.includes('youtu.be')"
                :src="getEmbedUrl(art.video_url)"
                class="w-full h-full border-0"
                style="aspectRatio: inherit"
                allow="autoplay; encrypted-media"
                allowfullscreen
              ></iframe>
              <video v-else 
                :src="art.video_url" 
                controls 
                autoplay 
                class="w-full h-full object-contain"
                @loadedmetadata="onVideoLoadedMetadata($event, art.id)"
              ></video>
              <button @click="togglePlay(null)" class="absolute top-2 right-2 z-30 bg-black text-white p-2 text-[8px] uppercase">Close ×</button>
            </div>

            <!-- IMAGE VIEW -->
            <div v-else class="relative w-full h-full flex items-center">
              
              <!-- Skeleton Placeholder - Minimal Background Only -->
              <div v-if="!isImageLoaded(art.id)" 
                   class="absolute inset-0 bg-zinc-50 animate-pulse">
              </div>

              <!-- Error State - Show Alt Text -->
              <div v-else-if="isImageError(art.id)"
                   class="absolute inset-0 bg-zinc-50 flex items-center justify-center px-6">
                <div class="text-center">
                  <!-- <svg class="w-8 h-8 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00-.707-1.707h-.879a3 3 0 00-3 3v2H9a1 1 0 000 2h3v4h-3a1 1 0 000 2h3v2a3 3 0 003 3h.879a1 1 0 00.707-1.707H14a2 2 0 01-2-2v-2m0 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg> -->
                  <p class="text-xs uppercase tracking-widest text-zinc-400 font-medium">{{ art.title }}</p>
                  <p class="text-[10px] text-zinc-300 mt-1">Image unavailable</p>
                </div>
              </div>

              <!-- Image -->
              <NuxtLink v-if="!art.is_video" :to="`/artwork/${art.slug}`" class="w-full h-full block relative z-10">
                <img 
                  :src="art.image_url" 
                  :loading="'lazy'"
                  class="w-full md:h-full md:w-auto object-contain cursor-pointer transition-opacity duration-300"
                  :class="{ 'opacity-0': !isImageLoaded(art.id) }"
                  :alt="art.title"
                  @load="onImageLoad($event, art.id)"
                  @error="onImageError(art.id)"
                />
              </NuxtLink>

              <template v-else>
                <img 
                  :src="art.image_url" 
                  :loading="'lazy'"
                  class="w-full md:h-full md:w-auto object-contain transition-opacity duration-300"
                  :class="{ 'opacity-0': !isImageLoaded(art.id) }"
                  :alt="art.title"
                  @load="onImageLoad($event, art.id)"
                  @error="onImageError(art.id)"
                />
                <div @click="togglePlay(art.id)" class="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/5 transition-colors z-20" :class="{ 'pointer-events-none': !isImageLoaded(art.id) || isImageError(art.id) }">
                   <div class="w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-200 shadow-xl hover:scale-110 transition-transform">
                     <svg viewBox="0 0 24 24" class="w-6 h-6 ml-1 fill-current text-black"><path d="M8 5v14l11-7z" /></svg>
                   </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Artwork Title -->
          <NuxtLink :to="`/artwork/${art.slug}`" class="block mt-4 hover:text-black transition-colors">
            <p class="text-[10px] uppercase tracking-widest text-zinc-400">
              {{ art.title }} <span v-if="art.year" class="opacity-50">({{ art.year }})</span>
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.series-description :deep(p) { margin-bottom: 2rem; }
.md\:overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }
.md\:overflow-x-auto::-webkit-scrollbar { display: none; }
</style>