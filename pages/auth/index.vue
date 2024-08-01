<script setup>
import {ref, reactive} from 'vue'
import {useAxios} from "~/composables/useAxios.js";

definePageMeta({
  layout: false
})
const {fetchOnlyGet, response: hashCode} = useAxios()
const {fetch, response: loginResponse, loading} = useAxios()
const authStore = useAuthStore()
const visible = ref(false)
const router = useRouter()
const loginForm = reactive({
  username: '',
  password: ''
})
const errors = reactive({
  username: '',
  password: ''
})


onMounted(async () => {
  // Obter hashCode
  await fetchOnlyGet('Init/init')
})

const validateForm = () => {
  let isValid = true
  if (!loginForm.username) {
    errors.username = 'Utilizador é obrigatório'
    isValid = false
  } else {
    errors.username = ''
  }

  if (!loginForm.password) {
    errors.password = 'Senha é obrigatória'
    isValid = false
  } else {
    errors.password = ''
  }

  return isValid
}

const login = async () => {
  if (!validateForm()) {
    return
  }
  // Login
  await fetch('Login/loginUserBasic', 'POST', {
    "strUserName": loginForm.username,
    "strPassword": loginForm.password,
    'strDomainName': 'ENH',
    "strHashCode": hashCode.value.hashCode
  })

  if (loginResponse.value) {
    // Salvar o hashCode.data.hashCode no localStorage
    localStorage.setItem('myToken', hashCode.value.hashCode);
    authStore.user = {
      username: loginForm.username,
    }
    await router.push({path: '/home'})
  } else {
    errors.username = 'Utilizador ou senha inválidos'
  }
}
</script>

<template>
  <div>
    <v-img
        lazy-src="https://pande.enh.co.mz/clients/ENH/images/loginlogo.png"
        src="https://pande.enh.co.mz/clients/ENH/images/loginlogo.png"
        aspect-ratio="1"
        class="mx-auto my-6 py-8"
        max-width="180"
    >
      <template v-slot:placeholder>
        <v-row
            align="center"
            class="fill-height ma-0"
            justify="center"
        >
          <v-progress-circular
              color="grey-lighten-5"
              indeterminate
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>

    <v-card
        class="mx-auto pa-12 pb-8"
        elevation="3"
        max-width="330"
        rounded="lg"
    >
      <div class="text-subtitle-1 text-medium-emphasis">Utilizador</div>
      <v-text-field
          density="compact"
          placeholder="insira o seu utilizador"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          v-model="loginForm.username"
          :error-messages="errors.username"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Senha
      </div>

      <v-text-field
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Insira a sua senha"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
          v-model="loginForm.password"
          :error-messages="errors.password"
          @keyup.enter="login"
      ></v-text-field>

      <v-btn
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          @click="login"
          :loading="loading"
          :disabled="loading"
          block
      >
        Entrar
      </v-btn>
    </v-card>
  </div>
</template>
