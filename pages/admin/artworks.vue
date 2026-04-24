<script setup>
const { data: artworks, refresh } = await useFetch("/api/artworks");
const { data: series } = await useFetch("/api/series");

const selectedSeries = ref("all");
const isEditing = ref(false);

const newArtwork = ref({
  id: null,
  title: "",
  year: "",
  series_id: "",
  description: "",
  size: "",
  medium: "",
  alt_text: "",
  is_video: false,
  video_url: "",
  image_url: "",
});

const fileInput = ref(null);
const videoFileInput = ref(null);

// --- NEW YOUTUBE AUTO-DETECTION LOGIC ---
watch(
  () => newArtwork.value.video_url,
  async (newUrl) => {
    if (!newUrl || !newArtwork.value.is_video) return;

    // 1. Extract ID (handles watch?v=, youtu.be/, and ?si= tracking)
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = newUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (videoId) {
      // 2. Set the standard quality thumbnail automatically
      newArtwork.value.image_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      // 3. Try to fetch the video title via YouTube's public oEmbed
      // This helps bypass the "missing title" error automatically
      try {
        const oEmbed = await $fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(newUrl)}&format=json`,
        );
        if (oEmbed && oEmbed.title && !newArtwork.value.title) {
          newArtwork.value.title = oEmbed.title;
        }
      } catch (e) {
        console.warn("Could not auto-fetch YouTube title.");
      }
    }
  },
);
// --- END AUTO-DETECTION ---

const filteredArtworks = computed(() => {
  if (!artworks.value) return [];
  if (selectedSeries.value === "all") return artworks.value;
  if (selectedSeries.value === "none")
    return artworks.value.filter((a) => !a.series_id);
  return artworks.value.filter(
    (a) => a.series_id === parseInt(selectedSeries.value),
  );
});

const selectArtwork = (art) => {
  isEditing.value = true;
  newArtwork.value = {
    ...art,
    is_video: !!art.is_video,
    video_url: art.video_url || "",
    image_url: art.image_url || "",
    year: art.year || "",
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const resetForm = () => {
  isEditing.value = false;
  newArtwork.value = {
    id: null,
    title: "",
    year: "",
    series_id: "",
    description: "",
    size: "",
    medium: "",
    alt_text: "",
    is_video: false,
    video_url: "",
    image_url: "",
  };
  if (fileInput.value) fileInput.value.value = "";
  if (videoFileInput.value) videoFileInput.value.value = "";
};

const uploadArtwork = async () => {
  // Now passes if we have an auto-generated image_url from YouTube
  const hasImage = fileInput.value?.files[0] || newArtwork.value.image_url;
  if (!newArtwork.value.title || (!isEditing.value && !hasImage)) {
    alert("Please provide a title and an image.");
    return;
  }

  const fd = new FormData();

  if (fileInput.value?.files[0]) fd.append("image", fileInput.value.files[0]);
  if (videoFileInput.value?.files[0])
    fd.append("video_file", videoFileInput.value.files[0]);

  fd.append("title", newArtwork.value.title);
  fd.append("year", newArtwork.value.year || "");
  fd.append("series_id", newArtwork.value.series_id || "");
  fd.append("description", newArtwork.value.description || "");
  fd.append("size", newArtwork.value.size || "");
  fd.append("medium", newArtwork.value.medium || "");
  fd.append("alt_text", newArtwork.value.alt_text || "");
  fd.append("is_video", newArtwork.value.is_video.toString());
  fd.append("video_url", newArtwork.value.video_url || "");
  fd.append("image_url", newArtwork.value.image_url || "");

  try {
    const url = isEditing.value
      ? `/api/artworks/${newArtwork.value.id}`
      : "/api/artworks/create";
    const method = isEditing.value ? "PATCH" : "POST";

    // Use $fetch which automatically sends cookies if credentials are enabled
    await $fetch(url, {
      method,
      body: fd,
      credentials: "include", // <-- Add this line
    });
    await refresh();
    resetForm();
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed. Check terminal for server logs.");
  }
};

const deleteArtwork = async (id) => {
  if (confirm("Delete artwork permanently?")) {
    await $fetch(`/api/artworks/${id}`, { method: "DELETE" });
    refresh();
    if (newArtwork.value.id === id) resetForm();
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-6">
    <div class="flex justify-between items-center mb-12">
      <NuxtLink
        to="/admin"
        class="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >← Dashboard</NuxtLink
      >

      <select
        v-model="selectedSeries"
        class="text-[10px] uppercase tracking-widest bg-transparent border-b border-zinc-200 focus:outline-none cursor-pointer pb-1"
      >
        <option value="all">All Artworks</option>
        <option value="none">Uncategorized</option>
        <option v-for="s in series" :key="s.id" :value="s.id">
          {{ s.title }}
        </option>
      </select>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="md:col-span-1 space-y-6 sticky top-12 h-fit">
        <div class="flex justify-between items-end">
          <h2 class="uppercase tracking-widest text-sm font-bold">
            {{ isEditing ? "Edit Artwork" : "Add Artwork" }}
          </h2>
          <button
            v-if="isEditing"
            @click="resetForm"
            class="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black"
          >
            Clear / New
          </button>
        </div>

        <div class="space-y-4 bg-zinc-50 p-6 border border-zinc-100 shadow-sm">
          <div>
            <label
              class="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1"
            >
              Thumbnail Image
            </label>

            <div
              v-if="newArtwork.image_url"
              class="mb-2 relative aspect-video bg-black overflow-hidden border border-zinc-200"
            >
              <img
                :src="newArtwork.image_url"
                class="w-full h-full object-cover opacity-80"
              />
              <div
                class="absolute bottom-1 right-1 bg-black/50 text-[7px] text-white px-1 uppercase tracking-tighter"
              >
                Current Source
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              class="text-[10px] uppercase w-full border p-2 bg-white mb-2"
            />

            <div class="bg-zinc-200/50 p-2 rounded">
              <label
                class="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1"
                >Image Path / URL</label
              >
              <input
                v-model="newArtwork.image_url"
                placeholder="Path will appear after upload"
                class="w-full text-[10px] font-mono bg-transparent focus:outline-none text-zinc-600"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <input
              v-model="newArtwork.title"
              placeholder="TITLE"
              class="col-span-2 border-b p-2 text-sm focus:outline-none bg-transparent"
            />
            <input
              v-model="newArtwork.year"
              placeholder="YEAR"
              class="col-span-1 border-b p-2 text-sm focus:outline-none bg-transparent"
            />
          </div>

          <select
            v-model="newArtwork.series_id"
            class="w-full border-b p-2 text-sm bg-transparent"
          >
            <option value="">NO SERIES</option>
            <option v-for="s in series" :key="s.id" :value="s.id">
              {{ s.title }}
            </option>
          </select>

          <div class="py-2 border-y border-zinc-200 my-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="newArtwork.is_video"
                class="accent-black"
              />
              <span class="text-[10px] uppercase tracking-widest font-bold"
                >This is a Video Work</span
              >
            </label>

            <div
              v-if="newArtwork.is_video"
              class="mt-4 space-y-3 bg-white p-3 border border-zinc-200"
            >
              <div>
                <label
                  class="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1"
                  >YouTube URL</label
                >
                <input
                  v-model="newArtwork.video_url"
                  placeholder="https://..."
                  class="w-full border-b p-1 text-xs focus:outline-none"
                />
                <p class="text-[7px] text-zinc-400 mt-1 uppercase italic">
                  Paste link to auto-fill title & thumb
                </p>
              </div>
              <div class="text-[8px] text-center text-zinc-300 italic">OR</div>
              <div>
                <label
                  class="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1"
                  >Upload .mp4 (Max 10mb)</label
                >
                <input
                  type="file"
                  ref="videoFileInput"
                  accept="video/mp4"
                  class="text-[9px] w-full"
                />
              </div>
            </div>
          </div>

          <input
            v-model="newArtwork.medium"
            placeholder="MEDIUM"
            class="w-full border-b p-2 text-sm focus:outline-none bg-transparent"
          />
          <input
            v-model="newArtwork.size"
            placeholder="SIZE"
            class="w-full border-b p-2 text-sm focus:outline-none bg-transparent"
          />

          <textarea
            v-model="newArtwork.description"
            placeholder="DESCRIPTION"
            class="w-full border p-2 text-sm h-20 focus:outline-none bg-white"
          ></textarea>

          <button
            @click="uploadArtwork"
            :class="isEditing ? 'bg-zinc-700' : 'bg-zinc-900'"
            class="w-full text-white py-4 text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
          >
            {{ isEditing ? "Update Artwork" : "Upload to Studio" }}
          </button>
        </div>
      </div>

      <div class="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          @click="resetForm"
          class="group relative aspect-square border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors bg-white"
          :class="{
            'border-zinc-500 bg-zinc-50': !isEditing && !newArtwork.id,
          }"
        >
          <div
            class="text-2xl font-light text-zinc-300 group-hover:text-zinc-500"
          >
            +
          </div>
          <p
            class="text-[9px] uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 mt-2"
          >
            New Artwork
          </p>
        </div>

        <div
          v-for="art in filteredArtworks"
          :key="art.id"
          @click="selectArtwork(art)"
          class="group relative aspect-square bg-zinc-100 overflow-hidden border border-zinc-200 cursor-pointer"
          :class="{
            'ring-2 ring-black ring-offset-2 z-10': newArtwork.id === art.id,
          }"
        >
          <!-- <img :src="art.image_url" :alt="art.alt_text" class="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" /> -->
          <NuxtImg
            :src="art.image_url"
            width="200"
            height="200"
            format="webp"
            quality="60"
            :alt="art.alt_text"
            class="object-cover w-full h-full grayscale hover:grayscale-0"
          />
          <!--  -->
          <div
            v-if="art.is_video"
            class="absolute top-2 right-2 bg-white/90 p-1 rounded-sm shadow-sm"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-3 h-3"
            >
              <path
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <div
            class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between"
          >
            <div>
              <p
                class="text-white text-[10px] uppercase tracking-widest font-bold"
              >
                {{ art.title }}
              </p>
              <p v-if="art.year" class="text-zinc-500 text-[8px]">
                {{ art.year }}
              </p>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-zinc-500 text-[8px] uppercase">Edit</span>
              <button
                @click.stop="deleteArtwork(art.id)"
                class="text-red-400 text-[9px] uppercase tracking-widest hover:text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
