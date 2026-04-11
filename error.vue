<script setup>
defineProps(['error'])
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
    <h1 class="text-4xl font-light tracking-[0.3em] mb-4">{{ error.statusCode }}</h1>
    <p class="text-[10px] uppercase tracking-widest text-zinc-400 mb-8">
      {{ error.message || 'Page not found' }}
    </p>
    <button @click="handleError" class="text-[10px] border border-zinc-200 px-6 py-2 uppercase tracking-widest hover:bg-black hover:text-white transition-all">
      Return Home
    </button>
  </div>
</template>