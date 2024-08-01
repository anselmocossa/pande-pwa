
export default defineNuxtRouteMiddleware(async (to, from) => {

  const authStore = useAuthStore()

  if (!localStorage.hasOwnProperty('myToken')) {
    return navigateTo('/auth/login')
  }


  if (!authStore.isAutenticado) {
    authStore.isAutenticado = authStore.checkUserHasSession()
    if (!authStore.isAutenticado && authStore.user.estado == 'Normal' ) {
      return navigateTo('/auth/login')
    }
  }

})
