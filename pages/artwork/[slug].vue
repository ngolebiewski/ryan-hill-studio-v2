<script setup>
const route = useRoute();
const router = useRouter();

// Tracking if the video is currently active
const isPlaying = ref(false);

// Fetching by slug from our API
const { data: artwork, error } = await useFetch(
  `/api/artworks/${route.params.slug}`,
  { key: `artwork-${route.params.slug}` }
);

// Error handling if artwork doesn't exist
if (error.value || !artwork.value) {
  throw createError({ statusCode: 404, statusMessage: "Artwork not found" });
}

// Navigation helper
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(
      artwork.value?.series_slug ? `/series/${artwork.value.series_slug}` : "/"
    );
  }
};

// Helper to convert YouTube URL to Embed URL
const getEmbedUrl = (url) => {
  if (!url) return '';
  let id = '';
  if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1];
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
};

// SEO and Meta Tags using computed to avoid null access before fetch completion
useHead({
  title: computed(() => {
    if (!artwork.value) return 'Studio';
    return artwork.value.year
      ? `${artwork.value.title} (${artwork.value.year}) | Nick Golebiewski`
      : `${artwork.value.title} | Nick Golebiewski`;
  }),
  meta: [
    {
      name: "description",
      content: computed(() => artwork.value?.description || `Artwork by Nick Golebiewski`)
    },
    {
      property: "og:title",
      content: computed(() => artwork.value ? `${artwork.value.title} (${artwork.value.year || ""})` : '')
    },
    { 
      property: "og:description", 
      content: computed(() => artwork.value?.description || '') 
    },
    { 
      property: "og:image", 
      content: computed(() => artwork.value?.image_url || '') 
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
</script>

<template>
  <div v-if="artwork" class="max-w-7xl mx-auto py-12 px-6 lg:py-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      
      <div class="lg:col-span-8">
        <div class="bg-zinc-50 flex justify-center items-center p-4 md:p-8 min-h-[60vh]">
          
          <div class="relative w-full flex flex-col items-center">
            <template v-if="isPlaying">
              <div class="shadow-2xl w-full bg-black flex flex-col items-center overflow-hidden">
                <iframe 
                  v-if="artwork.video_url?.includes('youtube') || artwork.video_url?.includes('youtu.be')"
                  :src="getEmbedUrl(artwork.video_url)"
                  class="w-full aspect-video border-0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                ></iframe>

                <video 
                  v-else
                  :src="artwork.video_url"
                  controls
                  autoplay
                  class="w-full h-auto max-h-[80vh] block"
                ></video>
                
                <button 
                  @click="isPlaying = false" 
                  class="py-4 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors bg-white w-full border-t border-zinc-100"
                >
                  View Still Image
                </button>
              </div>
            </template>

            <template v-else>
              <div class="relative inline-block">
                <img
                  :src="artwork.image_url"
                  :alt="artwork.alt_text || artwork.title"
                  class="max-w-full h-auto max-h-[80vh] shadow-2xl block"
                />
                
                <div v-if="artwork.is_video" 
                     @click="isPlaying = true"
                     class="absolute inset-0 flex items-center justify-center cursor-pointer group">
                   <div class="w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-100 shadow-2xl transition-transform hover:scale-110">
                     <svg viewBox="0 0 24 24" class="w-8 h-8 ml-1 fill-black">
                       <path d="M8 5v14l11-7z" />
                     </svg>
                   </div>
                </div>
              </div>
            </template>
          </div>

        </div>
      </div>

      <div class="lg:col-span-4 lg:sticky lg:top-24">
        <header class="mb-12">
          <h1 class="text-2xl font-light tracking-[0.3em] uppercase mb-2 text-zinc-900">
            {{ artwork.title }}
          </h1>
          <p v-if="artwork.series_title" class="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Part of the <span class="italic">{{ artwork.series_title }}</span> series
          </p>
        </header>

        <div class="space-y-8">
          <div class="text-[11px] uppercase tracking-[0.2em] text-zinc-500 space-y-4">
            <p v-if="artwork.medium" class="text-zinc-800">{{ artwork.medium }}</p>
            <p v-if="artwork.size">{{ artwork.size }}</p>
            <p v-if="artwork.year">{{ artwork.year }}</p>
          </div>

          <div v-if="artwork.description" class="py-8 border-y border-zinc-100">
            <p class="text-zinc-700 leading-relaxed font-serif text-lg">
              {{ artwork.description }}
            </p>
          </div>

          <div class="pt-4">
            <button 
              @click="goBack" 
              class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors cursor-pointer flex items-center gap-2"
            >
              <span class="text-lg">←</span> Back to Gallery
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: "Georgia", serif;
}
</style>