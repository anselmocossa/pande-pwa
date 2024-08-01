<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {useAxios} from "~/composables/useAxios";
import {EventBus} from '~/utils/eventBus';

const {fetch, getToken, response} = useAxios();
const alert = ref(false);
const linksFooter = ref([
  {
    id: 1,
    title: 'Pagina Inicial',
    url: '/',
    icon: 'mdi-home',
    content: 0,
  },
  {
    id: 2,
    title: 'Meus Pandes',
    url: '/lista',
    icon: 'mdi-view-list',
    content: 0,
  },
  {
    id: 3,
    title: 'Pesquisa',
    url: '/pesquisa',
    icon: 'mdi-magnify',
    content: 0,
  },
  {
    id: 4,
    title: 'Mais',
    url: '/mais',
    icon: 'mdi-dots-horizontal',
    content: 0,
  },
]);

const updateDocumentCount = (count) => {
  linksFooter.value.forEach((link) => {
    if (link.id === 1) {
      link.content = count;
    }
  });
};

const checkForNewDocuments = async () => {
  await fetch('MyDocumentsApp/listMyDocumentsApp', 'POST', {
    strHashCode: getToken(),
    intPageRowSize: '30',
    intCurrentPage: '1'
  });

  const currentCount = response.value.length;
  const existingCount = linksFooter.value.find(link => link.id === 1).content;

  if (currentCount !== existingCount) {
    EventBus.$emit('documentsUpdated', currentCount);
  }
};

onMounted(async () => {
  EventBus.$on('documentsUpdated', updateDocumentCount);

  const intervalId = setInterval(checkForNewDocuments, 60000); // Verifica a cada minuto

  onUnmounted(() => {
    clearInterval(intervalId);
    EventBus.$off('documentsUpdated', updateDocumentCount);
  });
});
</script>

<template>
  <v-app id="inspire">
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="px-5">
        <v-alert
            v-model="alert"
            type="info"
            prepend-icon="mdi-information-variant-circle-outline"
            border="start"
            close-label="Close Alert"
            color="orange-darken-4"
            title="Atenção"
            variant="tonal"
            closable
        >
          Informacoes do sistema
        </v-alert>
        <slot/>
      </v-container>
    </v-main>

    <layout-footer :links-footer="linksFooter"/>
    <!--    <layout-overlay-processing :overlay="authStore.localLoading  ? authStore.localLoading : loading" />-->

  </v-app>
</template>