<script setup>
// Minimalist Gate for Ryan Hill Studio
const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
    console.log('🔐 [GATE] Login attempt')
    console.log('🔐 [GATE] Email:', email.value)
  try {
    console.log('🔐 [GATE] Calling /api/auth/login')
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'include'
    })
    console.log('🔐 [GATE] Login response received, redirecting to /admin')
    
    // Use a hard redirect to ensure the cookie is picked up by the next page load
    window.location.href = '/admin'
  } catch (err) {
    console.log('🔐 [GATE] Login error:', err)
    error.value = 'Unauthorized'
  }
}
</script>

<template>
  <div class="h-screen flex items-center justify-center px-6">
    <form @submit.prevent="login" class="w-full max-w-xs space-y-8">
      <h2 class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 text-center">
        System Access
      </h2>
      
      <div class="space-y-4">
        <input 
          v-model="email" 
          type="email" 
          placeholder="EMAIL" 
          class="auth-input"
          required
        />
        
        <input 
          v-model="password" 
          type="password" 
          placeholder="PASSWORD" 
          class="auth-input no-uppercase"
          required
        />
      </div>

      <button 
        type="submit" 
        class="w-full py-3 bg-zinc-900 text-white text-[10px] tracking-[0.3em] uppercase hover:bg-black transition-colors"
      >
        Enter
      </button>

      <p v-if="error" class="text-[9px] text-red-500 text-center uppercase tracking-widest">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-input {
  /* Tailwind @apply for that minimalist line-style input */
  @apply w-full bg-transparent border-b border-zinc-200 py-2 text-[10px] tracking-widest focus:outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300;
}

/* Ensure the password characters (or bullets) don't try to transform */
.no-uppercase {
  text-transform: none !important;
}

/* Keep placeholders looking consistent with the brand */
::placeholder {
  text-transform: uppercase;
  letter-spacing: 0.3em;
}
</style>