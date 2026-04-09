<script setup>
definePageMeta({ middleware: 'admin' })

const isMounted = ref(false)
const token = useCookie('admin_token')

onMounted(() => {
  isMounted.value = true
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/admin/gate'
}
</script>

<template>
  <div v-if="isMounted && token">
    <div class="max-w-4xl mx-auto py-20 px-6">
      <h1 class="text-xl font-light tracking-[0.3em] uppercase mb-12">Studio Management</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] uppercase tracking-[0.2em]">
        <NuxtLink to="/admin/series" class="admin-card">Manage Series</NuxtLink>
        <NuxtLink to="/admin/artworks" class="admin-card">Upload Artwork</NuxtLink>
        <NuxtLink to="/admin/pages" class="admin-card">Edit About/CV</NuxtLink>
      </div>

      <div class="mt-20 border-t border-zinc-100 pt-10">
        <button @click="logout" class="text-[9px] uppercase tracking-[0.3em] text-zinc-400 hover:text-red-500 transition-colors">
          Logout / Clear Session
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="h-screen flex items-center justify-center">
    <span class="text-[9px] uppercase tracking-[0.4em] text-zinc-300">Authenticating...</span>
  </div>
</template>

<style scoped>
.admin-card {
  @apply p-8 border border-zinc-100 hover:bg-zinc-50 transition-all duration-300 flex items-center justify-center text-center;
}
</style>