<script setup>
const { data: artworks, refresh } = await useFetch('/api/artworks')
const { data: series } = await useFetch('/api/series')

const selectedSeries = ref('all')
const isEditing = ref(false)

const newArtwork = ref({
  id: null,
  title: '',
  series_id: '',
  description: '',
  size: '',
  medium: '',
  alt_text: ''
})

const fileInput = ref(null)

// Filtering logic
const filteredArtworks = computed(() => {
  if (!artworks.value) return []
  if (selectedSeries.value === 'all') return artworks.value
  if (selectedSeries.value === 'none') return artworks.value.filter(a => !a.series_id)
  return artworks.value.filter(a => a.series_id === parseInt(selectedSeries.value))
})

const selectArtwork = (art) => {
  isEditing.value = true
  newArtwork.value = { ...art }
  // Scroll to form on mobile if needed
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  isEditing.value = false
  newArtwork.value = { 
    id: null, 
    title: '', 
    series_id: '', 
    description: '', 
    size: '', 
    medium: '', 
    alt_text: '' 
  }
  if (fileInput.value) fileInput.value.value = ''
}

const uploadArtwork = async () => {
  // Guard: Title is always required; File only required for NEW uploads
  if (!newArtwork.value.title || (!isEditing.value && !fileInput.value?.files[0])) {
    alert("Please provide a title and an image.")
    return
  }

  const fd = new FormData()
  
  if (fileInput.value?.files[0]) {
    fd.append('image', fileInput.value.files[0])
  }
  
  fd.append('title', newArtwork.value.title)
  fd.append('series_id', newArtwork.value.series_id || '')
  fd.append('description', newArtwork.value.description || '')
  fd.append('size', newArtwork.value.size || '')
  fd.append('medium', newArtwork.value.medium || '')
  fd.append('alt_text', newArtwork.value.alt_text || '')

  try {
    const url = isEditing.value ? `/api/artworks/${newArtwork.value.id}` : '/api/artworks'
    const method = isEditing.value ? 'PATCH' : 'POST'

    await $fetch(url, {
      method: method,
      body: fd
    })
    
    await refresh()
    resetForm()
  } catch (err) {
    console.error("Upload failed:", err)
    alert("Upload failed. Check terminal for server logs.")
  }
}

const deleteArtwork = async (id) => {
  if (confirm('Delete artwork permanently?')) {
    await $fetch(`/api/artworks/${id}`, { method: 'DELETE' })
    refresh()
    if (newArtwork.value.id === id) resetForm()
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-6">
    <div class="flex justify-between items-center mb-12">
      <NuxtLink to="/admin" class="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">← Dashboard</NuxtLink>
      
      <select v-model="selectedSeries" class="text-[10px] uppercase tracking-widest bg-transparent border-b border-zinc-200 focus:outline-none cursor-pointer pb-1">
        <option value="all">All Artworks</option>
        <option value="none">Uncategorized</option>
        <option v-for="s in series" :key="s.id" :value="s.id">{{ s.title }}</option>
      </select>
    </div>
    
    <section class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="md:col-span-1 space-y-6 sticky top-12 h-fit">
        <div class="flex justify-between items-end">
          <h2 class="uppercase tracking-widest text-sm font-bold">
            {{ isEditing ? 'Edit Artwork' : 'Add Artwork' }}
          </h2>
          <button v-if="isEditing" @click="resetForm" class="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black">Clear / New</button>
        </div>
        
        <div class="space-y-4 bg-zinc-50 p-6 border border-zinc-100 shadow-sm">
          <div>
            <label class="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">Image File {{ isEditing ? '(Optional)' : '' }}</label>
            <input type="file" ref="fileInput" class="text-[10px] uppercase w-full border p-2 bg-white" />
          </div>

          <input v-model="newArtwork.title" placeholder="TITLE" class="w-full border-b p-2 text-sm focus:outline-none bg-transparent" />
          
          <select v-model="newArtwork.series_id" class="w-full border-b p-2 text-sm bg-transparent">
            <option value="">NO SERIES (Stays in Pool)</option>
            <option v-for="s in series" :key="s.id" :value="s.id">{{ s.title }}</option>
          </select>

          <input v-model="newArtwork.medium" placeholder="MEDIUM (e.g. Oil on Canvas)" class="w-full border-b p-2 text-sm focus:outline-none bg-transparent" />
          <input v-model="newArtwork.size" placeholder="SIZE (e.g. 24 x 36)" class="w-full border-b p-2 text-sm focus:outline-none bg-transparent" />
          
          <div>
            <label class="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">Alt Text (Accessibility)</label>
            <input v-model="newArtwork.alt_text" placeholder="Leave blank to auto-generate" class="w-full border-b p-2 text-sm focus:outline-none bg-transparent" />
          </div>

          <textarea v-model="newArtwork.description" placeholder="DESCRIPTION" class="w-full border p-2 text-sm h-24 focus:outline-none bg-white"></textarea>
          
          <button 
            @click="uploadArtwork" 
            :class="isEditing ? 'bg-zinc-700' : 'bg-zinc-900'"
            class="w-full text-white py-4 text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
          >
            {{ isEditing ? 'Update Artwork' : 'Upload to Studio' }}
          </button>
        </div>
      </div>

      <div class="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          @click="resetForm"
          class="group relative aspect-square border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors bg-white"
          :class="{ 'border-zinc-500 bg-zinc-50': !isEditing && !newArtwork.id }"
        >
          <div class="text-2xl font-light text-zinc-300 group-hover:text-zinc-500">+</div>
          <p class="text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 mt-2">New Artwork</p>
        </div>

        <div v-for="art in filteredArtworks" :key="art.id" 
          @click="selectArtwork(art)"
          class="group relative aspect-square bg-zinc-100 overflow-hidden border border-zinc-200 cursor-pointer"
          :class="{ 'ring-2 ring-black ring-offset-2 z-10': newArtwork.id === art.id }"
        >
          <img :src="art.image_url" :alt="art.alt_text" class="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
          
          <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
            <div>
              <p class="text-white text-[10px] uppercase tracking-widest font-bold">{{ art.title }}</p>
              <p class="text-zinc-400 text-[9px] uppercase tracking-widest">{{ art.medium }}</p>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-zinc-500 text-[8px] uppercase">Edit</span>
              <button @click.stop="deleteArtwork(art.id)" class="text-red-400 text-[9px] uppercase tracking-widest hover:text-red-200">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>