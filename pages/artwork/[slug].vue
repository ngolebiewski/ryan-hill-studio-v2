<script setup>
const route = useRoute()
const router = useRouter() // This gives us access to history

const { data: artwork, error } = await useFetch(`/api/artworks/${route.params.slug}`)

if (error.value || !artwork.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artwork not found' })
}

// The 'Easier Way' to go back
const goBack = () => {
  // If there is history, go back; otherwise, fall back to the main series index
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div v-if="artwork" class="max-w-6xl mx-auto py-12 px-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
      
      <div class="md:col-span-8">
        <img 
          :src="artwork.image_url" 
          :alt="artwork.title"
          class="w-full h-auto shadow-sm"
        />
      </div>

      <div class="md:col-span-4 flex flex-col justify-end pb-12">
        <h1 class="text-xl font-light tracking-[0.2em] uppercase mb-4 text-zinc-900">
          {{ artwork.title }}
        </h1>
        
        <div class="text-[11px] uppercase tracking-[0.2em] text-zinc-500 space-y-2">
          <div class="mb-8">
            <p class="text-zinc-800 italic normal-case tracking-normal text-sm mb-2">
              {{ artwork.description }}
            </p>
            <p>{{ artwork.size }}</p>
          </div>

          <div class="pt-8 border-t border-zinc-100">
            <button 
              @click="goBack"
              class="text-zinc-400 hover:text-zinc-900 transition-colors tracking-[0.3em] uppercase cursor-pointer"
            >
              ← Back to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>