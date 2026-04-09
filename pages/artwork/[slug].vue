<script setup>
const route = useRoute()

const { data } = await useFetch(`/api/artwork/${route.params.slug}`)
</script>

<template>
  <div v-if="data" class="p-4">
    <div class="flex flex-col items-center">
      <img
        :src="data.image_url"
        class="max-h-[80vh] object-contain"
      />

      <div class="mt-4 text-center">
        <h1 class="text-lg">{{ data.title }}</h1>
        <p class="text-sm text-gray-500">
          {{ data.size }}
        </p>
        <p class="mt-2 max-w-xl">
          {{ data.description }}
        </p>
      </div>
    </div>
  </div>
</template>