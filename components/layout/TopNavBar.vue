<script setup>
import {ref, onMounted} from 'vue';
import logoPane from '../../assets/mainlogo.png';
import {getColor, getInitials} from '~/composables/utils.js'

const authStore = useAuthStore();
const emit = defineEmits(['update:tabs']);
const props = defineProps({
  asTabs: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
});

const drawer = ref(false);
const selectedTab = ref('Estão comigo'); // Define a aba selecionada como string vazia
const opcoes = [
  'Estão comigo',
  'Estão no Departamento',
  'Tomar Conhecimento'
];

function toggleDrawer() {
  drawer.value = !drawer.value;
}

function updateTabs(value) {
  selectedTab.value = value;
  emit('update:tabs', value);
}
</script>

<template>
  <v-app-bar color="white" class="modern-app-bar" :elevation="1">
    <!-- Ícone de menu no lado esquerdo -->
    <v-app-bar-nav-icon @click="toggleDrawer"/>
    <!-- Logo -->
    <v-img :lazy-src="logoPane"
           :src="logoPane"
           alt="Pande"
           max-width="180"/>
    <v-spacer></v-spacer>

    <!-- Botão de filtro no lado direito -->
    <v-menu v-if="asTabs">
      <template v-slot:activator="{ props }">
        <v-btn
            icon="mdi-filter-variant"
            v-bind="props"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
            v-for="(item, index) in opcoes"
            :key="index"
            :value="index"
        >
          <v-list-item-title
              @click="updateTabs(item)"
          >
            {{ item }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="progress-bar"
        height="4"
    />
  </v-app-bar>
  <!-- Barra de carregamento na parte inferior do app-bar -->

  <!-- Chip para mostrar a aba selecionada -->
  <v-chip
      v-if="asTabs"
      :text="selectedTab"></v-chip>
  <!-- Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" app>
    <!-- Informações do usuário e Avatar -->
    <v-sheet class="pa-4 d-flex align-center" color="grey-lighten-4">
      <!-- Avatar com cor dinâmica e iniciais -->
      <v-avatar :color="getColor(authStore.user.nomeUtilizador)" class="mr-3">
        {{ getInitials(authStore.user.nomeUtilizador) }}
      </v-avatar>
      <div>
        <div>{{ authStore.user.email || 'Email não disponível' }}</div>
        <div>{{ authStore.user.nomeUtilizador || 'Nome não disponível' }}</div>
      </div>
    </v-sheet>

    <v-divider></v-divider>

    <!-- Lista de navegação -->
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
.modern-app-bar {
  background-color: #3b82f6;
  color: white;
  transition: background-color 0.3s ease;
  position: relative;
}

.modern-app-bar:hover {
  background-color: #2563eb;
}

.v-btn {
  transition: all 0.2s ease-in-out;
}

.v-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-navigation-drawer {
  background-color: #f3f4f6;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
