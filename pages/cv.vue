<script setup>
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
const { data: page } = await useFetch('/api/pages/cv')

const renderedContent = computed(() => {
  return page.value ? md.render(page.value.content_markdown) : ''
})

useHead({
  title: 'CV | Ryan Hill Studio'
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <div v-if="page">
      <div class="flex justify-between items-baseline mb-16">
        <h1 class="text-xl font-light tracking-[0.2em] uppercase">Curriculum Vitae</h1>
        <a href="/ryan-hill-cv.pdf" class="text-[10px] uppercase tracking-widest hover:underline text-zinc-400">Download PDF</a>
      </div>

      <div 
        class="cv-content text-sm"
        v-html="renderedContent" 
      />
    </div>
  </div>
</template>

<style>
/* CV Specific Styling */
.cv-content h2 {
  @apply text-[11px] uppercase tracking-[0.2em] font-bold border-b pb-2 mt-12 mb-6 text-zinc-900;
}

.cv-content ul {
  @apply space-y-2 mb-8;
}

.cv-content li {
  @apply flex flex-col md:flex-row md:gap-4 text-zinc-700;
}

/* If you format your markdown as: "- 2024 Gallery Name, City" */
.cv-content li::before {
  content: none;
}
</style>