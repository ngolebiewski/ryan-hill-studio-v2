<script setup>
import MarkdownIt from 'markdown-it'

const route = useRoute()
const md = new MarkdownIt()
const activeVideoId = ref(null) // Tracks which video is currently playing

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

// Helper to convert YouTube URL to Embed URL
const getEmbedUrl = (url) => {
  if (!url) return ''
  let id = ''
  if (url.includes('v=')) id = url.split('v=')[1].split('&')[0]
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
}

const togglePlay = (id) => {
  activeVideoId.value = activeVideoId.value === id ? null : id
}

// SEO
useHead({
  title: computed(() => data.value?.series?.title ? `${data.value.series.title} | Studio` : 'Series'),
})
</script>

<template>
  <div class="py-4">
    <div v-if="pending" class="p-12 text-xs uppercase tracking-widest animate-pulse">
      Loading...
    </div>

    <div v-else-if="error" class="p-12 text-red-500">
      Error loading series
    </div>

    <div v-else-if="data" class="space-y-12">
      <h1 class="text-xl font-light tracking-[0.2em] uppercase px-4">
        {{ data.series?.title }}
      </h1>

      <div class="flex flex-col gap-16 md:hidden px-4">
        <div v-if="renderedDescription" 
             class="series-description prose prose-zinc text-zinc-500 uppercase tracking-widest text-[10px] leading-relaxed"
             v-html="renderedDescription">
        </div>

        <div v-for="art in sortedArtworks" :key="art.id" class="space-y-4">
          <div class="relative bg-zinc-50 overflow-hidden">
            <template v-if="activeVideoId === art.id">
              <div class="aspect-video w-full bg-black">
                <iframe 
                  v-if="art.video_url?.includes('youtube') || art.video_url?.includes('youtu.be')"
                  :src="getEmbedUrl(art.video_url)"
                  class="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                ></iframe>
                <video v-else :src="art.video_url" controls autoplay class="w-full h-auto"></video>
              </div>
              <button @click="togglePlay(null)" class="w-full bg-zinc-100 text-[8px] uppercase tracking-widest py-2">Close Video ×</button>
            </template>

            <template v-else>
              <img :src="art.image_url" class="w-full h-auto" :alt="art.title" />
              <div v-if="art.is_video" @click="togglePlay(art.id)" class="absolute inset-0 flex items-center justify-center">
                 <div class="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-200 shadow-lg">
                   <svg viewBox="0 0 24 24" class="w-5 h-5 ml-1 fill-black"><path d="M8 5v14l11-7z" /></svg>
                 </div>
              </div>
            </template>
          </div>
          <NuxtLink :to="`/artwork/${art.slug}`" class="block">
            <p class="text-[10px] uppercase tracking-widest text-zinc-400">
              {{ art.title }} <span v-if="art.year" class="opacity-50">({{ art.year }})</span>
            </p>
          </NuxtLink>
        </div>
      </div>

      <div class="hidden md:flex gap-12 overflow-x-auto pb-12 px-12 snap-x items-center">
        
        <div v-if="renderedDescription" 
             class="flex-shrink-0 snap-start w-[400px] h-[60vh] flex flex-col justify-center pr-12 border-r border-zinc-100">
          <div class="series-description text-zinc-400 uppercase tracking-[0.2em] text-[11px] leading-loose"
               v-html="renderedDescription">
          </div>
        </div>

        <div
          v-for="art in sortedArtworks"
          :key="art.id"
          class="flex-shrink-0 snap-center relative group"
        >
          <div class="relative h-[75vh] flex items-center bg-zinc-50 overflow-hidden">
            
            <template v-if="activeVideoId === art.id">
              <div class="h-full aspect-video bg-black flex items-center justify-center">
                <iframe 
                  v-if="art.video_url?.includes('youtube') || art.video_url?.includes('youtu.be')"
                  :src="getEmbedUrl(art.video_url)"
                  class="h-full w-full border-0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                ></iframe>

                <video 
                  v-else
                  :src="art.video_url"
                  controls
                  autoplay
                  class="h-full w-auto object-contain"
                ></video>
              </div>
              
              <button @click="togglePlay(null)" class="absolute top-4 right-4 z-20 bg-black text-white p-2 text-[8px] uppercase tracking-tighter">Close ×</button>
            </template>

            <template v-else>
              <img
                :src="art.image_url"
                class="h-full w-auto object-contain"
                :alt="art.title"
              />
              
              <div v-if="art.is_video" 
                   @click="togglePlay(art.id)"
                   class="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/5 transition-colors">
                 <div class="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-200 shadow-xl hover:scale-110 transition-transform">
                   <svg viewBox="0 0 24 24" class="w-6 h-6 ml-1 fill-current text-black">
                     <path d="M8 5v14l11-7z" />
                   </svg>
                 </div>
              </div>
            </template>
          </div>

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
/* Gallery Description Context */
.series-description :deep(p) {
  margin-bottom: 2rem;
}

.series-description :deep(strong) {
  color: #18181b;
  font-weight: 700;
}

/* Hide Scrollbar */
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>