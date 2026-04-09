<script setup>
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
const { data: page } = await useFetch('/api/pages/contact')

const renderedContent = computed(() => {
  return page.value ? md.render(page.value.content_markdown) : ''
})
</script>

<template>
  <div class="h-[60vh] flex items-center justify-center px-4">
    <div v-if="page" class="text-center">
      <h1 class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-8">
        {{ page.title }}
      </h1>
      
      <div 
        class="contact-content text-sm md:text-base leading-relaxed text-zinc-800"
        v-html="renderedContent" 
      />
    </div>
  </div>
</template>

<style>
/* Styling for the Contact Stub */
.contact-content p {
  @apply mb-4;
}

/* Make the name stand out slightly */
.contact-content p:first-child {
  @apply text-xl font-light tracking-widest uppercase mb-12 text-zinc-900;
}

.contact-content a {
  @apply underline underline-offset-4 hover:text-zinc-500 transition-colors;
}
</style>