<script setup>
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
const { data: page } = await useFetch('/api/pages/about')

const renderedContent = computed(() => {
  return page.value ? md.render(page.value.content_markdown) : ''
})
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <div v-if="page">
      <h1 class="text-xl font-light tracking-[0.2em] uppercase mb-16">
        {{ page.title }}
      </h1>
      
      <div 
        class="markdown-content space-y-8 leading-relaxed text-zinc-800"
        v-html="renderedContent" 
      />
    </div>
  </div>
</template>

<style>
/* Clean typography for Bio/Statement */
.markdown-content strong {
  @apply block text-[10px] uppercase tracking-[0.25em] mt-12 mb-4 font-semibold text-zinc-900;
}

.markdown-content p {
  @apply mb-6 text-sm md:text-base;
}

.markdown-content img {
  @apply w-full h-auto my-12 object-cover;
}
</style>