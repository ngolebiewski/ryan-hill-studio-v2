<script setup>
const route = useRoute();
const router = useRouter();

// Fetching by slug from our API
const { data: artwork, error } = await useFetch(
  `/api/artworks/${route.params.slug}`,
);

if (error.value || !artwork.value) {
  throw createError({ statusCode: 404, statusMessage: "Artwork not found" });
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    // If they landed here directly, take them to the specific series if it exists
    router.push(
      artwork.value.series_slug ? `/series/${artwork.value.series_slug}` : "/",
    );
  }
};

// Meta tags for SEO/Social sharing
useHead({
  title: `${artwork.value.title} | Ryan Hill Studio`,
  meta: [
    { name: "description", content: artwork.value.description },
    { property: "og:image", content: artwork.value.image_url },
  ],
});
</script>

<template>
  <div v-if="artwork" class="max-w-7xl mx-auto py-12 px-6 lg:py-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      <div class="lg:col-span-8">
        <div class="bg-zinc-50 flex justify-center items-center p-4 md:p-8">
          <img
            :src="artwork.image_url"
            :alt="artwork.alt_text || artwork.title"
            class="max-w-full h-auto shadow-2xl"
          />
        </div>
      </div>

      <div class="lg:col-span-4 lg:sticky lg:top-24">
        <header class="mb-12">
          <h1
            class="text-2xl font-light tracking-[0.3em] uppercase mb-2 text-zinc-900"
          >
            {{ artwork.title }}
          </h1>
          <p
            v-if="artwork.series_title"
            class="text-[10px] uppercase tracking-[0.2em] text-zinc-400"
          >
            Part of the
            <span class="italic">{{ artwork.series_title }}</span> series
          </p>
        </header>

        <div class="space-y-8">
          <div
            class="text-[11px] uppercase tracking-[0.2em] text-zinc-500 space-y-4"
          >
            <p v-if="artwork.medium" class="text-zinc-800">
              {{ artwork.medium }}
            </p>
            <p v-if="artwork.size">{{ artwork.size }}</p>
          </div>

          <div v-if="artwork.description" class="py-8 border-y border-zinc-100">
            <p class="text-zinc-700 leading-relaxed font-serif text-lg">
              {{ artwork.description }}
            </p>
          </div>

          <div class="pt-4">
            <button
              @click="goBack"
              class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors cursor-pointer flex items-center gap-2"
            >
              <span class="text-lg">←</span> Back to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the serif font for the description looks elegant */
.font-serif {
  font-family: "Georgia", serif;
}
</style>
