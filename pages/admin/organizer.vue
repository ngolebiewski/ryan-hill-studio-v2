<script setup>
import draggable from 'vuedraggable'

const route = useRoute() // Access query params
const { data: artworks, refresh: refreshArtworks } = await useFetch('/api/artworks')
const { data: series } = await useFetch('/api/series')

// Initialize selectedSeriesId from the URL query if it exists
const selectedSeriesId = ref(route.query.seriesId ? parseInt(route.query.seriesId) : null)

// Automatically enter reorder mode if we came from the series page
const isReorderMode = ref(!!route.query.seriesId)

const searchQuery = ref('')

/**
 * THE SERIES SHELF (Left Side)
 * Filters artworks belonging to the selected series, sorted by order_index.
 */
const seriesArtworks = computed({
  get: () => {
    if (!selectedSeriesId.value || !artworks.value) return []
    return artworks.value
      .filter(a => a.series_id === parseInt(selectedSeriesId.value))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  },
  set: (newList) => {
    // When an item is dropped here, we don't save to DB yet, 
    // but we update the local object state for the preview.
    newList.forEach((art, index) => {
      art.order_index = index
      art.series_id = parseInt(selectedSeriesId.value)
    })
  }
})

/**
 * THE STUDIO POOL (Right Side)
 * Shows artworks that are either uncategorized OR belong to other series.
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
    // When dragging OUT of the series back to the pool, nullify the series_id
    newList.forEach(art => {
      if (art.series_id === parseInt(selectedSeriesId.value)) {
        art.series_id = null
        art.order_index = 0
      }
    })
  }
})

/**
 * BATCH UPDATE
 * Sends the final array of IDs to server/api/series/reorder.patch.ts
 */
const saveOrder = async () => {
  if (!selectedSeriesId.value) return

  const artworkIds = seriesArtworks.value.map(a => a.id)
  
  try {
    await $fetch('/api/series/reorder', {
      method: 'PATCH',
      body: { 
        artworkIds, 
        seriesId: selectedSeriesId.value 
      }
    })
    
    await refreshArtworks()
    isReorderMode.value = false
    alert("Series organization saved.")
  } catch (err) {
    console.error(err)
    alert("Failed to save reorder. check console.")
  }
}

// Visual helper for the placeholder
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
        <div class="flex items-center justify-between">
          <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            Currently In: <span class="text-black">{{ getSeriesTitle() }}</span>
          </h2>
          <span class="text-[9px] text-zinc-400 uppercase">{{ seriesArtworks.length }} Items</span>
        </div>

        <draggable 
          v-model="seriesArtworks" 
          group="studio-flow" 
          item-key="id"
          :disabled="!isReorderMode"
          ghost-class="opacity-20"
          class="space-y-2 min-h-[500px] bg-zinc-50 p-6 border-2 border-dashed border-zinc-100 rounded-sm"
        >
          <template #item="{ element }">
            <div class="flex items-center gap-4 bg-white p-3 border border-zinc-200 shadow-sm transition-transform" 
                 :class="isReorderMode ? 'cursor-grab active:cursor-grabbing hover:border-zinc-400' : 'opacity-80'">
              <span v-if="isReorderMode" class="text-zinc-300 font-mono text-lg">⠿</span>
              <img :src="element.image_url" class="w-14 h-14 object-cover grayscale" />
              <div class="flex-1 min-w-0">
                <p class="text-[10px] uppercase tracking-widest font-bold truncate">{{ element.title }}</p>
                <p class="text-[9px] text-zinc-400 uppercase truncate">{{ element.medium || 'No Medium Set' }}</p>
              </div>
            </div>
          </template>
        </draggable>
      </section>

      <section class="lg:col-span-7 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">Studio Pool</h2>
          <div class="relative">
            <input v-model="searchQuery" placeholder="Filter images..." 
                   class="bg-transparent border-b border-zinc-200 text-[10px] p-1 uppercase tracking-widest focus:outline-none focus:border-black w-48" />
          </div>
        </div>

        <draggable 
          v-model="studioPool" 
          group="studio-flow" 
          item-key="id"
          :disabled="!isReorderMode"
          ghost-class="opacity-20"
          class="grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-[500px] items-start"
        >
          <template #item="{ element }">
            <div class="relative aspect-square bg-zinc-200 group overflow-hidden border border-transparent" 
                 :class="isReorderMode ? 'cursor-grab hover:border-black' : 'opacity-80'">
              <img :src="element.image_url" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              
              <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                <p class="text-white text-[8px] uppercase tracking-widest mb-1">{{ element.title }}</p>
                <p v-if="element.series_id" class="text-zinc-400 text-[7px] uppercase italic">In other series</p>
              </div>
            </div>
          </template>
        </draggable>
      </section>

    </div>

    <div v-else class="py-32 text-center border-2 border-dashed border-zinc-100">
      <p class="text-zinc-400 uppercase tracking-widest text-[11px]">Select a series from the menu above to begin organizing.</p>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the smooth dragging feel */
.sortable-ghost {
  @apply bg-zinc-900 border-zinc-900;
}

.sortable-drag {
  @apply rotate-2 scale-105 shadow-2xl z-50;
}
</style>