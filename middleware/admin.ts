// middleware/admin.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('admin_token')

  if (!token.value && to.path !== '/admin/gate') {
    return navigateTo('/admin/gate')
  }

  if (token.value && to.path === '/admin/gate') {
    return navigateTo('/admin')
  }
})