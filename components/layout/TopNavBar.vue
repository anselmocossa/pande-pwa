<script setup>
import {onMounted} from "vue";

const authStore = useAuthStore()
import img from '@/assets/logo.png'

const emit = defineEmits(['pesquisa', 'update:tabs'])
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  pesquisa: {
    type: Boolean,
    default: false
  },
  search: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  asTabs: {
    type: Boolean,
    default: false
  },
  tabs: {
    type: Number,
    default: 1
  }
})
const search = ref(props.search)
const drawer = ref(false)
const selectedTab = ref(1)
onMounted(() => {
  selectedTab.value = props.tabs
})
function toggleDrawer() {
  drawer.value = !drawer.value
}

function navigateTo(route) {
  // Adicione a navegação para a rota desejada
  // Exemplo: this.$router.push(route)
}

function updateTabs(value) {
  selectedTab.value = value
  emit('update:tabs', value)
}

watch(() => search.value, (value) => {
  emit('pesquisa', value)
})
</script>


<template>
  <v-app-bar color="#5c90da" :elevation="1">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="toggleDrawer"/>
    </template>
    <v-app-bar-title v-if="!pesquisa" @click="toggleDrawer">
      {{ title }}
    </v-app-bar-title>
    <v-text-field
        :loading="loading"
        v-if="pesquisa"
        class="mx-6"
        v-model="search"
        clearable
        append-icon="mdi-magnify"
        label="Pesquisar"
        single-line
        variant="solo"
        hide-details
    />
    <v-btn icon="" @click="authStore.logout()">
      <v-icon>mdi-export</v-icon>
    </v-btn>

    <template
        v-if="asTabs"
        v-slot:extension>
      <v-slide-group
          show-arrows
      >
        <v-slide-group-item
            v-for="n in 3"
            :key="n"
            v-slot="{ isSelected, toggle }"
        >
          <v-btn
              :color="isSelected ? 'primary' : undefined"
              class="ma-2"
              rounded
              @click="toggle"
          >
            Options {{ n }}
          </v-btn>
        </v-slide-group-item>
      </v-slide-group>

<!--      <v-chip-group-->
<!--          v-model:active-chips="selectedTab"-->
<!--          color="white"-->
<!--          variant="flat"-->
<!--          mandatory-->
<!--          column-->
<!--          class="custom-chip-group"-->
<!--      >-->
<!--        <v-chip-->
<!--            :value="1"-->
<!--            @click="updateTabs(1)"-->
<!--            class="custom-chip"-->
<!--        >-->
<!--          <v-icon left>mdi-office-building</v-icon>-->
<!--          Departamento-->
<!--        </v-chip>-->

<!--        <v-chip-->
<!--            :value="2"-->
<!--            @click="updateTabs(2)"-->
<!--            class="custom-chip"-->
<!--        >-->
<!--          <v-icon left>mdi-book-open-page-variant</v-icon>-->
<!--          Conhecimentos-->
<!--        </v-chip>-->

<!--        <v-chip-->
<!--            :value="3"-->
<!--            @click="updateTabs(3)"-->
<!--            class="custom-chip"-->
<!--        >-->
<!--          <v-icon left>mdi-account-multiple</v-icon>-->
<!--          Delegados-->
<!--        </v-chip>-->
<!--      </v-chip-group>-->
      <v-spacer/>
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app>
    <v-sheet class="pa-4" color="grey-lighten-4">
      <div>john@google.com</div>
    </v-sheet>

    <v-divider></v-divider>

    <v-list>
      <v-list-item @click="navigateTo('/about')" prepend-icon="mdi-earth">
        <v-list-item-title>Sobre</v-list-item-title>
      </v-list-item>
      <v-list-item @click="navigateTo('/contact')" prepend-icon="mdi-phone">
        <v-list-item-title>Contactos de Apoio</v-list-item-title>
      </v-list-item>
      <v-list-item @click="authStore.logout()" prepend-icon="mdi-logout">
        <v-list-item-title>Terminar a sessão</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.custom-chip-group .v-chip {
  color: white; /* Cor do texto dos chips */
  background-color: transparent; /* Fundo transparente para chips não selecionados */
}

.custom-chip-group .v-chip.v-chip--active {
  color: white; /* Cor do texto dos chips selecionados */
  background-color: green; /* Fundo verde para chips selecionados */
}

.custom-chip-group .v-icon {
  color: inherit; /* Garante que o ícone herde a cor do texto do chip */
}

a {
  background-color: transparent;
  cursor: pointer;
  text-decoration: none;
}
</style>
