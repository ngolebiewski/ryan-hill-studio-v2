<script setup>
const { data: artworks, refresh } = await useFetch('/api/artworks')
const { data: series } = await useFetch('/api/series')

const newArtwork = ref({
  title: '',
  series_id: '',
  description: '',
  size: '',
  medium: '',
  alt_text: ''
})
const fileInput = ref(null)

const uploadArtwork = async () => {
  const fd = new FormData()
  fd.append('image', fileInput.value.files[0])
  fd.append('title', newArtwork.value.title)
  fd.append('series_id', newArtwork.value.series_id)
  fd.append('description', newArtwork.value.description)
  fd.append('size', newArtwork.value.size)
  fd.append('medium', newArtwork.value.medium)
  fd.append('alt_text', newArtwork.value.alt_text)

  await $fetch('/api/artworks', {
    method: 'POST',
    body: fd
  })
  
  refresh()
  // Reset form
}

const deleteArtwork = async (id) => {
  if (confirm('Delete artwork?')) {
    await $fetch(`/api/artworks/${id}`, { method: 'DELETE' })
    refresh()
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-6">
    <NuxtLink to="/admin" class="text-[10px] uppercase tracking-widest text-zinc-400 mb-12 inline-block">← Dashboard</NuxtLink>
    
    <section class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="md:col-span-1 space-y-6">
        <h2 class="uppercase tracking-widest text-sm font-bold">Add Artwork</h2>
        <input type="file" ref="fileInput" class="text-[10px] uppercase w-full border p-2" />
        <input v-model="newArtwork.title" placeholder="TITLE" class="w-full border-b p-2 text-sm focus:outline-none" />
        <select v-model="newArtwork.series_id" class="w-full border-b p-2 text-sm bg-transparent">
          <option value="">NO SERIES</option>
          <option v-for="s in series" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
        <input v-model="newArtwork.medium" placeholder="MEDIUM (e.g. Oil on Canvas)" class="w-full border-b p-2 text-sm focus:outline-none" />
        <input v-model="newArtwork.size" placeholder="SIZE (e.g. 24 x 36)" class="w-full border-b p-2 text-sm focus:outline-none" />
        <textarea v-model="newArtwork.description" placeholder="DESCRIPTION" class="w-full border p-2 text-sm h-24 focus:outline-none"></textarea>
        <button @click="uploadArtwork" class="w-full bg-zinc-900 text-white py-3 text-[10px] uppercase tracking-widest hover:bg-black">Upload to Studio</button>
      </div>

      <div class="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="art in artworks" :key="art.id" class="group relative aspect-square bg-zinc-100 overflow-hidden border border-zinc-200">
          <img :src="art.image_url" class="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
          <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
            <div>
              <p class="text-white text-[10px] uppercase tracking-widest">{{ art.title }}</p>
              <p class="text-zinc-400 text-[9px] uppercase tracking-widest">{{ art.medium }}</p>
            </div>
            <button @click="deleteArtwork(art.id)" class="text-red-400 text-[9px] uppercase tracking-widest text-left">Delete</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>