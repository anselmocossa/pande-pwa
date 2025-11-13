<script setup>
import {getColor, getInitials} from '~/composables/utils.js'
import {defineProps, defineEmits} from 'vue'

const emits = defineEmits(['read-more', 'delegar', 'conhecer', 'recolher'])
const props = defineProps({
  document: Object,
  cardDetails: {
    type: Boolean,
    default: true
  },
  showAvatar: {
    type: String,
    default: 'delegar'
  }
})

const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<template>
  <v-card
      class="mb-2 fixed-width-card bg-white text-black"
      density="compact"
      variant="text"
      border="1"
  >
    <v-card-title class="d-flex align-center">
      <v-avatar
        v-if="showAvatar === 'delegar' || showAvatar === 'recolher'"
          :color="getColor(document.entityDoc)" color="primary" class="mr-3">
        {{ getInitials(document.entityDoc) }}
      </v-avatar>
      <div v-if="showAvatar === 'delegar' || showAvatar === 'recolher'">
        <div>{{ document.entityDoc }}</div>
        <div class="text-caption">{{ document.code }}</div>
      </div>
      <div v-else>
        <div>{{ document.code }}</div>
      </div>
    </v-card-title>
    <v-card-text class="p-0 mb-1 pl-4">
      {{ document.subject }}
    </v-card-text>
    <template v-slot:actions>
      <div class="d-flex justify-end align-center w-100 p-0">
        <p class="text-caption mr-4">
          Data de entrega: {{ document.registryDate }}
        </p>
        <v-btn color="primary"
               variant="text"
               @click="$emit('read-more', document.idgdDocument)">
          Ler Mais
        </v-btn>
        <v-btn
            color="primary"
            variant="text"
            v-if="showAvatar === 'delegar'"
            @click="$emit('delegar', document.idgdDocument)">
          Delegar
        </v-btn>
        <v-btn
            color="primary"
            variant="text"
            v-if="showAvatar === 'conhecer'"
            @click="$emit('conhecer', document.idgdDocument)">
          {{ windowWidth < 600 ? 'Conhecer' : 'Tomar Conhecimento' }}
        </v-btn>
        <v-btn
            color="primary"
            variant="text"
            v-if="showAvatar === 'recolher'"
            @click="$emit('recolher', document.idgdDocument)">
          {{ windowWidth < 600 ? 'Recolher' : 'Recolher Documento' }}
        </v-btn>

      </div>
    </template>
  </v-card>
</template>


<style scoped>
.fixed-width-card {
  width: 100%; /* Defina a largura fixa desejada */
}

.bg-white {
  background-color: #ffffff !important;
}

.text-black {
  color: #000000 !important;
}
</style>
