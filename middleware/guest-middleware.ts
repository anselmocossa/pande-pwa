
export default defineNuxtRouteMiddleware((to, from) => {

  const authStore = useAuthStore()

  if (!authStore.isAutenticado) {
    return navigateTo('/auth')
  }

})
