export const useAuthStore = defineStore('auth', () => {

    const user = ref({
        estado: '',
        nomeUtilizador: '',
        codigo: '',
        email: "",
        cargo: "",
        chefia: "",
        grupoFuncional: "",
        grupos: "10533"
    })
    const isAutenticado = ref(false)
    const localLoading = ref(false)
    const iniciaisUser = ref('AC')

    const xMoveMouse = ref(0)
    const timeoutDuration = ref(null)
    const minutos = ref(0)

    const {fetch, fetchOnlyGet, statusCode, getToken} = useAxios()

    /**
     * @description verificar se o usuario tem Sessão
     * @returns {boolean}
     */
    const checkUserHasSession = async () => {
        localLoading.value = true
        const hashCode = getToken
        localLoading.value = false
        if (hashCode !== '') {
            isAutenticado.value == true
            // iniciaisUser.value =  user.value.nome.charAt(0)+user.value.apelido.charAt(0)
            return true
        }
        return false
    }

    /**
     * @description terminar a Sessão do usuário
     */
    const logout = async () => {
        localLoading.value = true
        localLoading.value = false
        isAutenticado.value == false
        localStorage.removeItem("myToken")
        window.location.href = "/auth"
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
        }, minutos.value * 60 * 1000);
    }

    /**
     * @description sempre que mexer o mouse recomeça o timeout com tempo 15*60*1000
     */
    const resetTimeOut = () => {
        clearTimeout(timeoutDuration.value)
        timeOut()
    }

    const getUserInfo = async () => {
        const res = await fetchOnlyGet('/Document/getUserInfo')
        if (statusCode.value === 200) {
            user.value = res.data
        }
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
        updateMoveMouse,
        getUserInfo
    }
})
