<script setup>
// Server middleware (server/middleware/admin-auth.ts) protects this route
const { data: series, refresh } = await useFetch('/api/series')

const updateOrder = async (id, newOrder) => {
  await $fetch(`/api/series/${id}`, {
    method: 'PUT',
    body: { order_index: newOrder }
  })
  refresh()
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-12">
    <header class="flex justify-between items-center mb-12">
      <h1 class="text-xl font-light tracking-widest uppercase">Manage Series</h1>
      <button class="text-[10px] border px-4 py-2 uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all">
        + New Series
      </button>
    </header>

    <div class="space-y-4">
      <div v-for="s in series" :key="s.id" class="flex items-center justify-between p-4 border border-zinc-100 group">
        <div>
          <span class="text-[10px] text-zinc-400 mr-4 font-mono">#{{ s.order_index }}</span>
          <span class="uppercase tracking-widest text-sm">{{ s.title }}</span>
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
           <button class="text-xs text-zinc-400 hover:text-red-600 px-2">Delete</button>
           <button class="text-xs text-zinc-400 hover:text-zinc-900 px-2">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>