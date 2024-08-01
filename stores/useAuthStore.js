
export const useAuthStore = defineStore('auth', () => {
  
  const user = ref({
    estado: ''
  })
  const isAutenticado = ref(false)
  const localLoading = ref(false)
  const iniciaisUser = ref('')

  const xMoveMouse = ref(0)
  const timeoutDuration = ref(null)
  const minutos=ref(0)

  const { fetch, fetchOnlyGet, statusCode} = useAxios()

  /**
   * @description verificar se o usuario tem Sessão
   * @returns {boolean} 
   */
  const checkUserHasSession = async () => {
    localLoading.value = true
    user.value = await fetchOnlyGet('user')
    localLoading.value = false
    if (statusCode.value === 200) {
      isAutenticado.value == true
      iniciaisUser.value =  user.value.nome.charAt(0)+user.value.apelido.charAt(0)
      return true
    }
    return false
  }

  /**
   * @description terminar a Sessão do usuário
   */
  const logout = async () => {
    localLoading.value = true
    await fetch('logout', 'post')
    localLoading.value = false
    isAutenticado.value == false
    localStorage.removeItem("myToken")
    window.location.href = "/auth/login"
  }

  /**
   * @description alterar posição x dos movimentos do mouse
   */
  function updateMoveMouse(event) {
    xMoveMouse.value = event.pageX
  }
  

  /**
   * @description contrar os movimentos do mouse
   */
  watch(xMoveMouse, (newX) => {
    resetTimeOut()
  })
  
  /**
   * @description terminar a Sessão automaticamente depois de 15*60*1000 sem mexer o mouse
   */
  const timeOut = () => {    
    timeoutDuration.value = setTimeout(() => {
          window.removeEventListener('mousemove', updateMoveMouse)
          logout()
        },minutos.value*60*1000);
  }
  
  /**
   * @description sempre que mexer o mouse recomeça o timeout com tempo 15*60*1000
   */
  const resetTimeOut = () => {
      clearTimeout(timeoutDuration.value)
      timeOut()
  }

  return {
    user,
    isAutenticado,
    checkUserHasSession,
    logout,
    localLoading,
    iniciaisUser,
    timeOut,
    minutos,
    updateMoveMouse
  }
})