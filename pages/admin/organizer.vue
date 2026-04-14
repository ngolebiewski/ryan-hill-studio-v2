<script setup>
import draggable from 'vuedraggable'

const route = useRoute()

// Fetch artworks with a unique key and cache disabled for admin accuracy
const { data: artworks, refresh: refreshArtworks } = await useFetch('/api/artworks', {
  key: 'admin-artwork-organizer',
  initialCache: false
})
const { data: series } = await useFetch('/api/series')

const selectedSeriesId = ref(route.query.seriesId ? parseInt(route.query.seriesId) : null)
const isReorderMode = ref(!!route.query.seriesId)
const searchQuery = ref('')

/**
 * THE SERIES SHELF (Left Side)
 * Mutates the master artworks array directly to prevent "snap-back"
 */
const seriesArtworks = computed({
  get: () => {
    if (!selectedSeriesId.value || !artworks.value) return []
    return artworks.value
      .filter(a => a.series_id === parseInt(selectedSeriesId.value))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  },
  set: (newList) => {
    if (!artworks.value) return
    
    // Create a map for quick lookup of the new order
    const newOrderMap = new Map(newList.map((item, index) => [item.id, index]))

    // Update the master list
    artworks.value = artworks.value.map(art => {
      if (newOrderMap.has(art.id)) {
        return {
          ...art,
          series_id: parseInt(selectedSeriesId.value),
          order_index: newOrderMap.get(art.id)
        }
      }
      return art
    })
  }
})

/**
 * THE STUDIO POOL (Right Side)
 */
const studioPool = computed({
  get: () => {
    if (!artworks.value) return []
    return artworks.value.filter(a => {
      const isNotCurrentSeries = a.series_id !== parseInt(selectedSeriesId.value)
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      return isNotCurrentSeries && matchesSearch
    })
  },
  set: (newList) => {
    if (!artworks.value) return
    
    // If an item is in this list, ensure it doesn't belong to the active series locally
    const poolIds = new Set(newList.map(a => a.id))

    artworks.value = artworks.value.map(art => {
      if (poolIds.has(art.id) && art.series_id === parseInt(selectedSeriesId.value)) {
        return { ...art, series_id: null, order_index: 0 }
      }
      return art
    })
  }
})

const saveOrder = async () => {
  if (!selectedSeriesId.value) return

  // We send the IDs in the exact order they appear in the computed 'seriesArtworks'
  const artworkIds = seriesArtworks.value.map(a => a.id)
  
  try {
    await $fetch('/api/artworks/reorder', {
      method: 'POST', 
      body: { 
        artworkIds, 
        seriesId: parseInt(selectedSeriesId.value) 
      }
    })
    
    await refreshArtworks()
    isReorderMode.value = false
    alert("Series organization saved successfully.")
  } catch (err) {
    console.error("Save Error:", err)
    alert("Failed to save. Check server logs.")
  }
}

const getSeriesTitle = () => {
  const s = series.value?.find(s => s.id === parseInt(selectedSeriesId.value))
  return s ? s.title : 'Select Series'
}
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-6 pb-32">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-zinc-100 pb-8">
      <div>
        <NuxtLink to="/admin" class="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black mb-4 block">
          ← Dashboard
        </NuxtLink>
        <h1 class="text-2xl font-light tracking-[0.3em] uppercase">Series Organizer</h1>
      </div>
      
      <div class="flex flex-wrap gap-4 items-center">
        <select v-model="selectedSeriesId" class="text-[10px] uppercase tracking-widest bg-white border border-zinc-200 p-3 focus:outline-none min-w-[200px]">
          <option :value="null">Choose a series...</option>
          <option v-for="s in series" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
        
        <button v-if="selectedSeriesId" @click="isReorderMode = !isReorderMode" 
          :class="isReorderMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-zinc-50 border-zinc-200'"
          class="text-[10px] uppercase tracking-widest px-6 py-3 border transition-all font-bold">
          {{ isReorderMode ? '🔓 Reorder Enabled' : '🔒 Lock Layout' }}
        </button>
        
        <button v-if="isReorderMode" @click="saveOrder" class="text-[10px] bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-zinc-800 transition-all">
          Save Changes
        </button>
      </div>
    </header>

    <div v-if="selectedSeriesId" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <section class="lg:col-span-5 space-y-4">
        <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">
          In: <span class="text-black">{{ getSeriesTitle() }}</span>
        </h2>

        <ClientOnly>
          <draggable 
            v-model="seriesArtworks" 
            group="art-flow" 
            item-key="id"
            :disabled="!isReorderMode"
            ghost-class="opacity-10"
            class="space-y-2 min-h-[500px] bg-zinc-50 p-6 border-2 border-dashed border-zinc-100 rounded-sm"
          >
            <template #item="{ element }">
              <div class="flex items-center gap-4 bg-white p-3 border border-zinc-200 shadow-sm" 
                   :class="isReorderMode ? 'cursor-grab active:cursor-grabbing hover:border-zinc-400' : 'opacity-80'">
                <span v-if="isReorderMode" class="text-zinc-300 font-mono text-lg">⠿</span>
                <img :src="element.image_url" class="w-14 h-14 object-cover grayscale" />
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] uppercase tracking-widest font-bold truncate">{{ element.title }}</p>
                  <p class="text-[9px] text-zinc-400 uppercase truncate">{{ element.medium }}</p>
                </div>
              </div>
            </template>
          </draggable>
        </ClientOnly>
      </section>

      <section class="lg:col-span-7 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">Studio Pool</h2>
          <input v-model="searchQuery" placeholder="Filter..." 
                 class="bg-transparent border-b border-zinc-200 text-[10px] p-1 uppercase tracking-widest focus:outline-none focus:border-black w-32" />
        </div>

        <ClientOnly>
          <draggable 
            v-model="studioPool" 
            group="art-flow" 
            item-key="id"
            :disabled="!isReorderMode"
            ghost-class="opacity-10"
            class="grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-[500px]"
          >
            <template #item="{ element }">
              <div class="relative aspect-square bg-zinc-200 group overflow-hidden border border-transparent" 
                   :class="isReorderMode ? 'cursor-grab hover:border-black' : 'opacity-80'">
                <img :src="element.image_url" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
            </template>
          </draggable>
        </ClientOnly>
      </section>
    </div>
  </div>
</template>