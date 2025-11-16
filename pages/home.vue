<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue';
import Swal from 'sweetalert2';
import {useAxios} from '@/composables/useAxios';
import DocumentCard from '../components/home/DocumentCard.vue';
import DocumentDetails from '../components/home/DocumentDetails.vue';
import EnviarServicoModal from '~/components/home/EnviarServicoModal.vue';
import {EventBus} from '~/utils/eventBus';

const {fetch, getToken, response, loading} = useAxios();
const sendDialog = ref(false);
const strDocumentNumber = ref('');
const dialog = ref(false);
const movimentHistory = ref([]);
const documentoResumed = ref([]);
const documentos = ref([]);
const anexos = ref([]);
const processing = ref(true);
const handleAcao = ref('delegar');
const fetchDocuments = async () => {
  await getMyDocuments();
};

const updateDocuments = async () => {
  await getMyDocuments();
};

const getMyDocuments = async (url = '/MyDocumentsApp/listMyDocumentsApp') => {
      const strHashCode = getToken();
      if (url === '/MyTeams/listMyTeamDocumentsWithOrder') {
        await fetch(url, 'POST', {
          strHashCode,
          intPageRowSize: '30',
          intCurrentPage: '1',
          intIDTeam: '10533',
          strOrder: ''
        });
      } else {
        await fetch(url, 'POST', {
          strHashCode,
          intPageRowSize: '30',
          intCurrentPage: '1',
          strSearch: ''
        });
      }


      if (response && response.value) {
        const documentPromises = response.value.map(async (item) => {
          const historyResponse = await fetch('/Document/getDocumentHistoryResumed', 'POST', {
            strHashCode: getToken(),
            strDocumentIDEncrypted: item.idgdDocument
          });

          if (historyResponse) {
            // Ordena por data de movimento e pega a última data
            const sortedHistory = historyResponse.sort((a, b) => new Date(b.dateHistory) - new Date(a.dateHistory));
            item.registryDate = sortedHistory.length > 0 ? sortedHistory[0].dateHistory : null;
          }
          return item;
        });

        // Aguarda todas as promessas serem resolvidas
        documentos.value = await Promise.all(documentPromises);
      } else {
        documentos.value = [];
      }
    }
;

const documentosGrouped = computed(() => {
  processing.value = true;
  const grouped = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sortedDocs = documentos.value.slice().sort((a, b) => new Date(b.registryDate) - new Date(a.registryDate));

  const addToGroup = (label, document) => {
    let group = grouped.find(g => g.label === label);
    if (!group) {
      group = {type: 'header', label, documents: []};
      grouped.push(group);
    }
    group.documents.push(document);
  };

  sortedDocs.forEach(doc => {
    const docDate = new Date(doc.registryDate);
    docDate.setHours(0, 0, 0, 0);
    if (docDate.getTime() === today.getTime()) {
      addToGroup('Hoje', doc);
    } else if (docDate.getTime() === today.getTime() - (1000 * 60 * 60 * 24)) {
      addToGroup('Ontem', doc);
    } else if (today.getTime() - docDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      addToGroup('Semana Passada', doc);
    } else if (docDate.getMonth() === today.getMonth() && docDate.getFullYear() === today.getFullYear()) {
      addToGroup('Este Mês', doc);
    } else {
      const monthYear = `${docDate.toLocaleString('default', {month: 'long'})}, ${docDate.getFullYear()}`;
      addToGroup(monthYear, doc);
    }
  });

  processing.value = false;
  return grouped;
});

const handleReadMore = async (id) => {
  dialog.value = true;
  await fetch('/Document/getDocumentHistoryResumed', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: id
  });
  // vamos organizas os movimentos por data
  movimentHistory.value = response.value.sort((a, b) => new Date(b.dateHistory) - new Date(a.dateHistory));
  await fetch('/Document/getDocumentDataResumed', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: id
  });
  documentoResumed.value = response.value;
};

const onScroll = (e) => {
  onScroll.value = e.target.scrollTop;
};

const updateDialog = async (value) => {
  dialog.value = value;
  sendDialog.value = value;
  await getMyDocuments();
  await Swal.fire({
    title: 'Documento enviado com sucesso!',
    icon: 'success',
    showConfirmButton: false,
    timer: 1500
  });
};

const handleSend = (item) => {
  strDocumentNumber.value = item;
  sendDialog.value = true;
};

onMounted(async () => {
  await fetchDocuments();
  EventBus.$on('documentsUpdated', updateDocuments);
  processing.value = false;
});

onUnmounted(() => {
  EventBus.$off('documentsUpdated', updateDocuments);
});

const updateTabs = (tabs) => {
  if (tabs === 'Estão comigo') {
    getMyDocuments();
    handleAcao.value = 'delegar';
  }
  if (tabs === 'Estão no Departamento') {
    getMyDocuments('/MyTeams/listMyTeamDocumentsWithOrder');
    handleAcao.value = 'recolher';
  }
  if (tabs === 'Tomar Conhecimento') {
    getMyDocuments('/Document/listAllMyDocumentsConhecimento');
    handleAcao.value = 'conhecer';
  }
};

</script>

<template>
  <layout-top-nav-bar
      :loading="processing"
      :as-tabs="true"
      @update:tabs="updateTabs"
  />

  <v-container style="height: 400px"
               v-if="processing"
  >
    <v-row
        align-content="center"
        class="fill-height"
        justify="center"
    >
      <v-col
          class="text-subtitle-1 text-center"
          cols="12"
      >
        Carregar documentos...
      </v-col>
    </v-row>
  </v-container>
  <div v-else>
    <v-skeleton-loader
        v-for="n in 10"
        :key="n"
        v-if="loading"
        class="mb-2 fixed-width-card bg-white text-black"
        type="list-item-two-line"
    ></v-skeleton-loader>

    <div v-if="!loading && documentosGrouped.length > 0" @scroll="onScroll">
      <template v-for="(group, index) in documentosGrouped" :key="index">
        <v-list-subheader
            class="text-black mb-2"
            v-if="group.type === 'header'" inset>
          {{ group.label }}
        </v-list-subheader>
        <v-row>
          <DocumentCard
              v-for="item in group.documents"
              :key="item.code"
              :document="item"
              :show-avatar="handleAcao"
              @read-more="handleReadMore"
              @delegar="handleSend"
              @conhecer="handleSend"
          />
        </v-row>
      </template>
    </div>

    <v-empty-state
        v-else-if="!loading && !processing"
        class="mt-10"
        color="blue"
        icon="$success"
    >
      <template v-slot:media>
        <v-icon color="surface-variant"></v-icon>
      </template>

      <template v-slot:headline>
        <div class="text-h4">Sem Documentos Pendentes</div>
      </template>

      <template v-slot:title>
        <div class="text-h6">Não há documentos por tratar no momento.</div>
      </template>

      <template v-slot:text>
        <div class="text-medium-emphasis text-caption">
          Parabéns por manter seus documentos em dia! Se precisar tratar novos documentos, eles serão exibidos aqui.
        </div>
      </template>
    </v-empty-state>
  </div>
  <DocumentDetails
      :dialog="dialog"
      :movimentHistory="movimentHistory"
      :documentoResumed="documentoResumed"
      :loading-movimentes="loading"
      :anexos="anexos"
      @close="dialog = false"
      @update:dialog="updateDialog"
  />

  <EnviarServicoModal
      @close="sendDialog = false"
      @update:dialog="updateDialog"
      :acao="handleAcao"
      :is-active="sendDialog"
      :str-document-number="strDocumentNumber"
  />
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
