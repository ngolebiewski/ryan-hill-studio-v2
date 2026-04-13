<script setup>
const hero = "/images/ing.png" // put something in /public/images
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex items-center justify-center">
    <img
      :src="hero"
      alt="fullscreen artwork introducing Ryan Hill Studio, drawn text reads ING"
      class="max-h-full max-w-full object-contain"
    />
  </div>
</template>