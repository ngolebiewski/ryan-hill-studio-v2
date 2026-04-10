<script setup>
import draggable from 'vuedraggable'
import 'easymde/dist/easymde.min.css'

const { data: allSeries, refresh } = await useFetch('/api/series')
const selectedId = ref(null)
const editorContainer = ref(null)
let easymde = null

const organizedSeries = computed({
  get: () => {
    if (!allSeries.value) return []
    const parents = allSeries.value.filter(s => !s.parent_id)
    return parents.map(parent => ({
      ...parent,
      children: allSeries.value.filter(child => child.parent_id === parent.id)
    }))
  },
  set: (newValue) => {
    allSeries.value = newValue.flatMap(p => [
      { ...p, parent_id: null }, 
      ...(p.children || []).map(c => ({ ...c, parent_id: p.id }))
    ])
  }
})

const editDescription = async (series) => {
  // 1. Cleanup old instance to avoid the "weird small window" bug
  if (easymde) {
    easymde.toTextArea()
    easymde = null
  }

  // If clicking the same one again, just close it
  if (selectedId.value === series.id) {
    selectedId.value = null
    return
  }

  selectedId.value = series.id
  await nextTick()
  
  const EasyMDE = (await import('easymde')).default
  easymde = new EasyMDE({
    element: editorContainer.value,
    spellChecker: false,
    status: false,
    minHeight: "150px",
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "link", "preview"]
  })
  
  easymde.value(series.description || '')
}

const saveDescription = async (series) => {
  const content = easymde.value()
  try {
    await $fetch(`/api/series/${series.id}`, {
      method: 'PUT',
      body: { 
        description: content,
        parent_id: series.parent_id // Maintain hierarchy
      }
    })
    
    // Cleanup and Refresh
    if (easymde) {
      easymde.toTextArea()
      easymde = null
    }
    selectedId.value = null
    await refresh()
  } catch (err) {
    alert("Failed to write description to database.")
  }
}

const updateTitle = async (series) => {
  try {
    await $fetch(`/api/series/${series.id}`, {
      method: 'PUT',
      body: { title: series.title }
    })
    await refresh()
  } catch (err) { alert("Title update failed") }
}

const handleMove = async () => {
  const orders = []
  organizedSeries.value.forEach((parent, pIdx) => {
    orders.push({ id: parent.id, order_index: pIdx, parent_id: null })
    parent.children?.forEach((child, cIdx) => {
      orders.push({ id: child.id, order_index: cIdx, parent_id: parent.id })
    })
  })
  try {
    await $fetch('/api/series/reorder', { method: 'POST', body: { orders } })
    await refresh()
  } catch (err) { refresh() }
}

const checkMove = (evt) => {
  const draggedSeries = evt.draggedContext.element
  const isMovingToChildList = evt.to.classList.contains('sub-series-list')
  return !(isMovingToChildList && draggedSeries.children?.length > 0)
}

const createSeries = async (parentId = null) => {
  const title = prompt(parentId ? "New Sub-series Title:" : "New Top-level Series Title:")
  if (!title) return
  await $fetch('/api/series', { method: 'POST', body: { title, parent_id: parentId } })
  refresh()
}

const deleteSeries = async (id) => {
  if (!confirm("Delete this series?")) return
  await $fetch(`/api/series/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-6 pb-32">
    <NuxtLink to="/admin" class="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black mb-12 inline-block">
      ← Dashboard
    </NuxtLink>

    <header class="flex justify-between items-center mb-12">
      <h1 class="text-xl font-light tracking-widest uppercase">Manage Series</h1>
      <button @click="createSeries()" class="text-[10px] border border-zinc-200 px-4 py-2 uppercase tracking-widest hover:bg-black hover:text-white transition-all">
        + New Parent
      </button>
    </header>

    <draggable v-model="organizedSeries" item-key="id" handle=".handle" group="series" :move="checkMove" @end="handleMove" class="space-y-12">
      <template #item="{ element: parent }">
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 group">
            <div class="flex items-center flex-1">
              <span class="handle cursor-grab mr-4 text-zinc-300">⠿</span>
              <input v-model="parent.title" @blur="updateTitle(parent)" class="bg-transparent border-none uppercase tracking-widest text-sm font-medium focus:ring-0 w-full p-0" />
            </div>
            <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              <button @click="editDescription(parent)" class="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900">Edit Desc</button>
              <button @click="createSeries(parent.id)" class="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900">+ Sub</button>
              <button @click="deleteSeries(parent.id)" class="text-[9px] uppercase tracking-widest text-red-400">Delete</button>
            </div>
          </div>

          <div v-if="selectedId === parent.id" class="p-6 border border-zinc-200 bg-white shadow-sm mb-4">
            <textarea ref="editorContainer"></textarea>
            <button @click="saveDescription(parent)" class="mt-4 w-full bg-zinc-900 text-white text-[10px] py-3 uppercase tracking-widest hover:bg-black">Save Description</button>
          </div>

          <div class="pl-12">
            <draggable v-model="parent.children" item-key="id" handle=".child-handle" group="series" :move="checkMove" @end="handleMove" class="sub-series-list space-y-4 min-h-[20px] border-l border-zinc-100">
              <template #item="{ element: child }">
                <div class="space-y-2 ml-2">
                  <div class="flex items-center justify-between p-3 border border-zinc-100 bg-white group">
                    <div class="flex items-center flex-1">
                      <span class="child-handle cursor-grab mr-4 text-zinc-200">⠿</span>
                      <input v-model="child.title" @blur="updateTitle(child)" class="bg-transparent border-none uppercase tracking-widest text-[11px] text-zinc-600 focus:ring-0 w-full p-0" />
                    </div>
                    <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <button @click="editDescription(child)" class="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900">Edit Desc</button>
                      <button @click="deleteSeries(child.id)" class="text-[9px] uppercase tracking-widest text-red-400">Delete</button>
                    </div>
                  </div>

                  <div v-if="selectedId === child.id" class="p-6 border border-zinc-200 bg-white shadow-sm">
                    <textarea ref="editorContainer"></textarea>
                    <button @click="saveDescription(child)" class="mt-4 w-full bg-zinc-900 text-white text-[10px] py-3 uppercase tracking-widest hover:bg-black">Save Description</button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.sub-series-list:empty {
  background-color: rgba(244, 244, 245, 0.4);
  border: 1px dashed #e4e4e7;
  height: 30px;
}
</style>