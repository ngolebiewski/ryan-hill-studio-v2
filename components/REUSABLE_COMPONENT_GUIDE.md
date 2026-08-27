# ImageWithSkeleton Component - Reusable Image Loading Solution

## Overview

Instead of copy-pasting skeleton/loading/error logic across multiple pages, we've created a single reusable component that handles:

- ✅ Skeleton placeholder while loading
- ✅ Automatic aspect ratio detection
- ✅ Error state with graceful fallback
- ✅ Lazy loading
- ✅ Smooth fade-in transitions

---

## File Structure

```
components/
  └── ImageWithSkeleton.vue    ← The reusable component

pages/
  ├── index.vue                ← Home page (use component)
  ├── series/[slug].vue        ← Series gallery (already optimized)
  └── artwork/[slug].vue       ← Individual artwork page (use component)
```

---

## Installation

1. **Create the component** file:
   ```
   components/ImageWithSkeleton.vue
   ```
   (Already created for you)

2. **Nuxt auto-imports** - No additional setup needed!
   - Nuxt automatically discovers components in `/components` directory
   - Use `<ImageWithSkeleton />` directly in any page/component

3. **Update your pages** - Replace direct `<img>` tags with `<ImageWithSkeleton />`

---

## Basic Usage

### Home Page (index.vue)

**Before:**
```vue
<img
  :src="hero"
  alt="Drawing of a spiderweb and the letters ING"
  class="max-h-full max-w-full object-contain"
/>
```

**After:**
```vue
<ImageWithSkeleton
  :src="hero"
  alt="Drawing of a spiderweb and the letters ING"
  image-class="max-h-full max-w-full"
  object-fit="contain"
/>
```

### Artwork Page (pages/artwork/[slug].vue)

**Before:**
```vue
<img
  :src="artwork.image_url"
  :alt="artwork.alt_text || artwork.title"
  class="max-w-full h-auto max-h-[80vh] shadow-2xl block"
/>
```

**After:**
```vue
<ImageWithSkeleton
  :src="artwork.image_url"
  :alt="artwork.alt_text || artwork.title"
  image-class="max-w-full h-auto max-h-[80vh] shadow-2xl block"
  object-fit="contain"
  :default-aspect-ratio="16 / 9"
/>
```

---

## Props Reference

### `src` (required)
- **Type**: String
- **Description**: Image URL
- **Example**: `:src="artwork.image_url"`

### `alt` (required)
- **Type**: String
- **Description**: Alt text (used in error UI if image fails to load)
- **Example**: `:alt="artwork.title"`

### `object-fit` (optional)
- **Type**: String
- **Default**: `'contain'`
- **Options**: `'contain'`, `'cover'`, `'fill'`, `'scale-down'`
- **Description**: CSS object-fit property for the image
- **Example**: `object-fit="cover"`

### `container-class` (optional)
- **Type**: String
- **Default**: `''`
- **Description**: Additional CSS classes for the container div
- **Example**: `container-class="inline-block w-full"`

### `image-class` (optional)
- **Type**: String
- **Default**: `'w-full h-auto'`
- **Description**: CSS classes for the `<img>` element
- **Example**: `image-class="max-h-full max-w-full"`

### `default-aspect-ratio` (optional)
- **Type**: Number
- **Default**: `16 / 9`
- **Description**: Aspect ratio for loading state (if dimensions unknown)
- **Example**: `:default-aspect-ratio="4 / 3"`

### `error-aspect-ratio` (optional)
- **Type**: Number
- **Default**: `1 / 1`
- **Description**: Aspect ratio for error state (if dimensions unknown)
- **Example**: `:error-aspect-ratio="1 / 1"`

### `show-error-ui` (optional)
- **Type**: Boolean
- **Default**: `true`
- **Description**: Whether to show error message or just background
- **Example**: `:show-error-ui="true"`

---

## Usage Examples

### Example 1: Simple Hero Image
```vue
<ImageWithSkeleton
  :src="heroImage"
  alt="Hero image"
  image-class="max-h-full max-w-full"
  object-fit="contain"
/>
```

### Example 2: Gallery Image with Custom Ratio
```vue
<ImageWithSkeleton
  :src="galleryImage"
  alt="Gallery item"
  image-class="w-full h-auto"
  object-fit="cover"
  :default-aspect-ratio="4 / 3"
/>
```

### Example 3: Thumbnail with Small Square
```vue
<ImageWithSkeleton
  :src="thumbnail"
  alt="Thumbnail"
  image-class="w-48 h-48"
  object-fit="cover"
  :default-aspect-ratio="1 / 1"
  :error-aspect-ratio="1 / 1"
  container-class="rounded-lg overflow-hidden"
/>
```

### Example 4: Full Width with Custom Styling
```vue
<ImageWithSkeleton
  :src="artwork.image_url"
  :alt="artwork.title"
  image-class="w-full max-h-[80vh] object-center shadow-2xl"
  object-fit="contain"
  container-class="w-full flex items-center justify-center min-h-[60vh]"
  :default-aspect-ratio="16 / 9"
/>
```

### Example 5: Disable Error UI (just show placeholder)
```vue
<ImageWithSkeleton
  :src="artwork.image_url"
  :alt="artwork.title"
  :show-error-ui="false"
  image-class="w-full"
/>
```

---

## How It Works

### Loading State
1. Container renders with `default-aspect-ratio` (e.g., 16/9)
2. Skeleton placeholder shows (minimal `bg-zinc-50` with pulse)
3. Image starts loading in background
4. Container maintains size → no layout shift ✅

### Success State
1. Image finishes loading
2. `@load` event fires → captures natural dimensions
3. `aspectRatio` updates to actual image size
4. Image fades in (opacity-0 → 1)
5. Container resizes to match image ✅

### Error State
1. Image fails to load (404, timeout, etc.)
2. `@error` event fires immediately
3. Error UI displays (or just background if `show-error-ui="false"`)
4. Container uses `error-aspect-ratio` (square by default)
5. Shows alt text + "Image unavailable" message ✅

---

## Accessing Component State

If you need to check loading/error state from parent:

```vue
<template>
  <div>
    <ImageWithSkeleton
      ref="imageComponent"
      :src="src"
      alt="My image"
    />
    
    <button v-if="imageComponent?.isLoaded && !imageComponent?.isError">
      Image loaded!
    </button>
  </div>
</template>

<script setup>
const imageComponent = ref(null)
</script>
```

Available properties:
- `imageComponent.isLoaded` - Boolean
- `imageComponent.isError` - Boolean
- `imageComponent.aspectRatio` - Number (null if not yet calculated)

---

## Comparison: Before vs After

### Before (Code Duplication)
```
Home Page
  ├── Custom loading state
  ├── Custom error state
  └── Custom aspect ratio logic

Artwork Page
  ├── Custom loading state (copied from home)
  ├── Custom error state (copied from home)
  └── Custom aspect ratio logic (copied from home)

Series Page
  ├── Custom loading state (copied again)
  ├── Custom error state (copied again)
  └── Custom aspect ratio logic (copied again)

Problem: 3x the code, 3x the places to debug/fix 😞
```

### After (Reusable Component)
```
components/ImageWithSkeleton.vue
  ├── Loading state (once)
  ├── Error state (once)
  └── Aspect ratio logic (once)

Home Page → <ImageWithSkeleton />
Artwork Page → <ImageWithSkeleton />
Series Page → <ImageWithSkeleton />

Benefit: 1 source of truth, easy to maintain ✅
```

---

## Style Customization

### Skeleton Color
Edit `components/ImageWithSkeleton.vue` line 46:
```vue
<!-- Current: zinc-50 -->
<div v-if="!isLoaded" class="absolute inset-0 bg-zinc-50 animate-pulse"></div>

<!-- Alternative: white -->
<div v-if="!isLoaded" class="absolute inset-0 bg-white animate-pulse"></div>

<!-- Alternative: gray-100 -->
<div v-if="!isLoaded" class="absolute inset-0 bg-gray-100 animate-pulse"></div>
```

### Error Icon
Edit `components/ImageWithSkeleton.vue` lines 50-54 to use different SVG or icon.

### Error Message
Edit `components/ImageWithSkeleton.vue` lines 55-56:
```vue
<p class="text-xs uppercase tracking-widest text-zinc-400 font-medium">{{ alt }}</p>
<p class="text-[10px] text-zinc-300 mt-1">Image unavailable</p>
```

---

## Migration Checklist

- [ ] Create `components/ImageWithSkeleton.vue`
- [ ] Update `pages/index.vue` to use component
- [ ] Update `pages/artwork/[slug].vue` to use component
- [ ] Test loading state on slow network (DevTools throttling)
- [ ] Test error state (break an image URL temporarily)
- [ ] Test on mobile devices
- [ ] Delete any old skeleton/loading code from pages

---

## Performance Benefits

✅ **Reduced Bundle Size** - Share code across 3+ pages  
✅ **Easier Maintenance** - Fix bugs in one place  
✅ **Consistent UX** - All pages use same loading/error states  
✅ **Faster Development** - Paste 2 lines instead of 20  
✅ **Better Testability** - Unit test the component once, use everywhere  

---

## Future Enhancements

Once implemented, you could add:

1. **Blur-up placeholder** - Load low-quality image first
2. **Custom loading spinner** - Instead of just pulse
3. **Retry button on error** - Let users retry failed images
4. **Statistics tracking** - Log which images fail most
5. **Responsive srcset** - Serve different sizes per device

All updates in one component = updates everywhere! 🎉

---

## Support

If you need to adjust aspect ratios or styling, just edit:
- Aspect ratios: Props (`default-aspect-ratio`, `error-aspect-ratio`)
- Styling: Component's `<style>` or passed classes (`image-class`, `container-class`)
- Error UI: Component template lines 50-58

Everything is configurable without touching individual pages!
