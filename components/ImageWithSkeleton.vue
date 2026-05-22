<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  objectFit: {
    type: String,
    default: 'contain'
  },
  imageClass: {
    type: String,
    default: 'max-h-full max-w-full'
  },
  showErrorUI: {
    type: Boolean,
    default: true
  }
})

const isLoaded = ref(false)
const isError = ref(false)

const onImageLoad = (event) => {
  isLoaded.value = true
}

const onImageError = () => {
  isError.value = true
  isLoaded.value = true
}

defineExpose({
  isLoaded,
  isError
})
</script>

<template>
  <div class="relative inline-flex items-center justify-center overflow-hidden">
    <!-- Skeleton Placeholder - Minimal Background -->
    <div v-if="!isLoaded" class="absolute inset-0 bg-zinc-50 animate-pulse"></div>

    <!-- Error State - Show Alt Text -->
    <div v-else-if="isError && showErrorUI" class="absolute inset-0 bg-zinc-50 flex items-center justify-center px-6">
      <div class="text-center">
        <!-- <svg class="w-8 h-8 text-zinc-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00-.707-1.707h-.879a3 3 0 00-3 3v2H9a1 1 0 000 2h3v4h-3a1 1 0 000 2h3v2a3 3 0 003 3h.879a1 1 0 00.707-1.707H14a2 2 0 01-2-2v-2m0 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg> -->
        <p class="text-xs uppercase tracking-widest text-zinc-400 font-medium">{{ alt }}</p>
        <p class="text-[10px] text-zinc-300 mt-1">Image unavailable</p>
      </div>
    </div>

    <!-- Image -->
    <img 
      :src="src"
      :alt="alt"
      :loading="'lazy'"
      :class="[imageClass, { 'opacity-0': !isLoaded }]"
      :style="{ objectFit }"
      class="transition-opacity duration-300"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>