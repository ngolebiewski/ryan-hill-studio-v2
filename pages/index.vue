<script setup>
const hero = "/images/hero.jpg" // put something in /public/images
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex items-center justify-center">
    <img
      :src="hero"
      class="max-h-full max-w-full object-contain"
    />
  </div>
</template>