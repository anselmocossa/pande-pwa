import axios from 'axios'

/**
 * @fileoverview Funções para fazer requisições HTTP
 * @version 1.0.0
 * @author Salustiano Miambo
 */

export const useAxios = () => {

    /**
     * @description armazena a resposta da requisição
     * @type {any}
     * @default {}
     */
    const response = ref({})

    /**
     * @description informa se a requisição esta sendo processada ou ja terminou
     * true -> em processamento
     * false -> processo finalizado
     * @type {boolean}
     * @default false
     */
    let loading = ref(false)

    /**
     * @description armazena erros de validação de formulários
     * @type {any}
     * @default []
     */
    const errors = ref([])

    /**
     * @description armazena messagem de erro a serem exibida para os usuários ou utilizadores do sistema
     * @type {string}
     */
    let messageError = ref('')

    /**
   * @description armazena o codigo do estado da requisição
   * @type {int}
   */
    let statusCode = ref(0)

    const runtimeConfig = useRuntimeConfig()

    axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
    axios.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8'
    axios.defaults.headers.common['accept'] = 'application/json'
    axios.defaults.baseURL = runtimeConfig.public.base_url


    /**
     * @description Aplicável apenas para métodos de solicitação 'PUT', 'POST', 'PATCH'
     * @param {string} url 
     * @param {string} method 
     * @param {*} data 
     * @returns {JSON} dados enviados pelo servidor
     */
    const fetch = async (url, method, data = {}) => {

        errors.value = []
        loading.value = true
        messageError.value = ''

        try {

            const myResponse = await axios({ method, url, data })
            response.value = myResponse.data
            statusCode.value = myResponse.status
            return myResponse.data
        } catch (error) {
            errorCatch(error)
        } finally {
            loading.value = false
        }
    }

    
    /**
     * @description Aplicável para upload de ficheiros e valido
     * apenas para métodos de solicitação 'PUT', 'POST', 'PATCH'
     * @param {string} url 
     * @param {string} method 
     * @param {*} data 
     * @returns {JSON} dados enviados pelo servidor
     */
    const fetchMultipart = async (url, method, data = {}) => {

        errors.value = []
        loading.value = true
        messageError.value = ''

        try {

            axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'
            const myResponse = await axios({ method, url, data })
            response.value = myResponse.data
            statusCode.value = myResponse.status
            return myResponse.data
        } catch (error) {
            errorCatch(error)
        } finally {
            loading.value = false
        }
    }


    /**
     * @description Aplicável apenas para métodos de solicitação 'GET'
     * @param {string} url
     * @returns {JSON} dados enviados pelo servidor
     */
    const fetchOnlyGet = async (url) => {

        errors.value = []
        loading.value = true
        messageError.value = ''

        try {
            const myResponse = await axios.get(url)
            response.value = myResponse.data
            statusCode.value = myResponse.status
            return myResponse.data
        } catch (error) {
            errorCatch(error)
        } finally {
            loading.value = false
        }
    }

    /**
     * @description Aplicável apenas para métodos de solicitação 'DELETE'
     * @param {string} url
     * 
     */
    const fetchOnlyDelete = async (url) => {
        errors.value = []
        loading.value = true
        messageError.value = ''
        try {
            const myResponse = await axios.delete(url)
            response.value = myResponse.data
            statusCode.value = myResponse.status
            return myResponse.data
        } catch (error) {
            errorCatch(error)
        } finally {
            loading.value = false
        }
    }

    /**
     * @description: tratamento de erros
     * @param {Any} error 
     * 
     */
    const errorCatch = (error) => {

        if (error.code === "ERR_NETWORK") {
            messageError.value = 'Problemas de internet ou o servidor caiu'
            return
        }

        if (error.response) {
            switch (error.response.status) {
                case 422:
                    errors.value = error.response.data.errors
                    statusCode.value = 422
                    break
                case 500:
                    messageError.value  = 'Ocorreu um erro no servidor, contacte o administrador do sistema'
                    statusCode.value = 500
                    break
                case 404:
                    localStorage.removeItem("myToken")
                    window.location.href = "/auth"
                    break
                default:
                    messageError.value = 'Ocorreu um erro no servidor'
            }
        } else if (error.request) {
            messageError.value = 'Erro de requisição sem resposta'
            console.log(error.request);
        } else {
            messageError.value = 'Erro de configuração na requisição'
            console.log('Error', error.message);
        }
    }


    /**
     * @description decodificando o token
     * @returns {string} - valor do token
     * 
     */
    const getToken = () => {
        const myToken = localStorage.getItem("myToken")
        if (myToken === null) {
            return ''
        }
        return myToken
    }

    return {
        loading,
        fetch,
        fetchMultipart,
        fetchOnlyGet, 
        fetchOnlyDelete,       
        statusCode,
        errors,
        response,
        messageError,
        getToken
    }
}
