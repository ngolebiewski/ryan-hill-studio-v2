<script setup>
import 'easymde/dist/easymde.min.css'

const pages = ref([])
const selectedPage = ref(null)
const editorContainer = ref(null)
let easymde = null

// Fetch all pages on load
const { data, refresh } = await useFetch('/api/pages')
pages.value = data.value

onMounted(async () => {
  const EasyMDE = (await import('easymde')).default
  easymde = new EasyMDE({
    element: editorContainer.value,
    spellChecker: false,
    status: false,
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview"]
  })
})

const loadPage = (page) => {
  selectedPage.value = page
  if (easymde) {
    easymde.value(page.content_markdown || '')
  }
}

// --- NEW: CREATE PAGE ---
const createPage = async () => {
  const title = prompt("Enter Page Title (e.g. 'Press'):")
  if (!title) return

  // Basic slugify logic
  const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
  
  try {
    const newPage = await $fetch('/api/pages', {
      method: 'POST',
      body: { title, slug, content_markdown: '# ' + title }
    })
    await refresh() // Refresh the sidebar list
    pages.value = data.value
    loadPage(newPage) // Automatically open the new page
  } catch (err) {
    alert('Error creating page. Slug might already exist.')
  }
}

// --- NEW: DELETE PAGE ---
const deletePage = async () => {
  if (!selectedPage.value) return
  
  const protectedSlugs = ['about', 'cv', 'contact']
  if (protectedSlugs.includes(selectedPage.value.slug)) {
    alert("This is a core site page and cannot be deleted.")
    return
  }

  const confirmDelete = confirm(`Are you sure you want to delete "${selectedPage.value.title}"? This cannot be undone.`)
  if (!confirmDelete) return

  try {
    await $fetch(`/api/pages/${selectedPage.value.slug}`, { method: 'DELETE' })
    selectedPage.value = null
    easymde.value('')
    await refresh()
    pages.value = data.value
  } catch (err) {
    alert('Failed to delete page.')
  }
}

const handleSave = async () => {
  if (!selectedPage.value) return
  const markdownValue = easymde.value()
  
  try {
    await $fetch(`/api/pages/${selectedPage.value.slug}`, {
      method: 'PUT',
      body: { content_markdown: markdownValue }
    })
    alert(`${selectedPage.value.title} updated successfully`)
    selectedPage.value.content_markdown = markdownValue
  } catch (err) {
    console.error('❌ Save failed', err)
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-6 grid grid-cols-4 gap-12">
    <aside class="col-span-1 border-r border-zinc-100 pr-6">
      
      <NuxtLink 
        to="/admin" 
        class="inline-flex items-center text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black mb-12 transition-colors group"
      >
        <span class="mr-2 transition-transform group-hover:-translate-x-1">←</span> 
        Dashboard
      </NuxtLink>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-[10px] uppercase tracking-widest text-zinc-400">Site Pages</h2>
        <button @click="createPage" class="text-[14px] text-zinc-400 hover:text-black leading-none transition-colors">+</button>
      </div>
      
      <ul class="space-y-4">
        <li v-for="page in pages" :key="page.id">
          <button 
            @click="loadPage(page)"
            :class="['text-[11px] uppercase tracking-widest transition-colors text-left w-full', 
                     selectedPage?.id === page.id ? 'text-zinc-900 font-bold' : 'text-zinc-400 hover:text-zinc-600']"
          >
            {{ page.title }}
          </button>
        </li>
      </ul>
    </aside>

    <main class="col-span-3">
      <header v-if="selectedPage" class="flex justify-between items-center mb-8">
        <h1 class="text-xl font-light tracking-widest uppercase">Editing: {{ selectedPage.title }}</h1>
        <div class="flex gap-4">
          <button 
            @click="deletePage"
            class="text-[10px] px-6 py-2 uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
          <button 
            @click="handleSave" 
            class="bg-zinc-900 text-white text-[10px] px-6 py-2 uppercase tracking-widest hover:bg-black transition-colors"
          >
            Save Changes
          </button>
        </div>
      </header>

      <ClientOnly>
        <div v-show="selectedPage" class="editor-wrapper border border-zinc-100">
          <textarea ref="editorContainer"></textarea>
        </div>
        <template #fallback>
          <div v-if="selectedPage" class="h-[400px] flex items-center justify-center border border-zinc-100">
            <p class="text-[10px] uppercase tracking-widest text-zinc-300 animate-pulse">Loading Editor...</p>
          </div>
        </template>
      </ClientOnly>

      <div v-if="!selectedPage" class="h-[400px] flex items-center justify-center border border-dashed border-zinc-200">
        <p class="text-[10px] uppercase tracking-[0.3em] text-zinc-300">Select a page to begin editing</p>
      </div>
    </main>
  </div>
</template>