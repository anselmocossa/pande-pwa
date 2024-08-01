<script setup>
import {getColor, getInitials} from '~/composables/utils.js'
import {defineProps, defineEmits} from 'vue'

const emits = defineEmits(['read-more', 'delegar'])
const props = defineProps({
  document: Object,
  cardDetails: {
    type: Boolean,
    default: true
  }
})


</script>

<template>
  <v-card
      class="mb-2 fixed-width-card bg-white text-black"
      density="compact"
      variant="text"
      border="1"
  >
    <v-card-title class="d-flex align-center">
      <v-avatar :color="getColor(document.entityDoc)" color="primary" class="mr-3">
        {{ getInitials(document.entityDoc) }}
      </v-avatar>
      <div>
        <div>{{ document.entityDoc }}</div>
        <div class="text-caption">{{ document.code }}</div>
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
        <v-btn color="primary" variant="text" @click="$emit('read-more', document.idgdDocument)">
          Ler Mais
        </v-btn>
        <v-btn color="primary" variant="text" @click="$emit('delegar', document.idgdDocument)">
          Delegar
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
