<script setup>
import {defineProps, defineEmits} from 'vue'
import {getColor, getInitials, parseMovimentHistory, formatDate, getColorFile} from '~/composables/utils.js'
import {useAxios} from "~/composables/useAxios.js";
import EnviarServicoModal from "~/components/home/EnviarServicoModal.vue";
import axios from "axios";
import AnexoFile from "~/components/home/AnexoFile.vue";


const emits = defineEmits(['update:dialog', 'close'])
const {fetch, getToken, response, statusCode, loading} = useAxios()
const props = defineProps({
  dialog: Boolean,
  movimentHistory: Array,
  documentoResumed: Object,
  anexos: Array,
  loadingMovimentes: {
    type: Boolean,
    default: true
  },
  alterarEstado: {
    type: Boolean,
    default: true
  }
})
const localAlterarEstado = ref(props.alterarEstado)
const snackbar = ref(false)
const anexos = ref([])
const sendDialog = ref(false)
const sheet = ref(false)
const strDocumentNumber = ref(''); // Armazena o ID do documento
const loadingFiles = reactive({})
const documentoPrincipal = ref(null)
const acao = ref('enviar')
const showAll = ref(false)
const anexoModal = ref(false)
const items =
    [
      {title: 'Delegar', isVisible: true},
      {title: 'Exportar', isVisible: true},
      {title: 'Anexos Novos', isVisible: true}
    ]
const handleSend = (item) => {
  strDocumentNumber.value = item; // Armazena o ID do documento
  sendDialog.value = true; // Abre o bottom-sheet
};

onUpdated(async () => {
  if (!props.dialog) {
    return
  }
  await fetch('/Document/listDocumentFiles', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: props.documentoResumed.idgdDocument
  })
  // vamos remover todos os ficheiros que não são anexos onde isAttachment é false
  anexos.value = response.value.filter((item) => item.isAttachment === true)
  // vamos gravar o documento principal aqui, documento principal e aquele que tem isAttachment a false, lembra que o documento principla e a penas 1 por isso vamos pegar o primeiro item
  documentoPrincipal.value = response.value.filter((item) => item.isAttachment === false)[0]
})

const updateDialog = (value) => {
  sheet.value = value
  sendDialog.value = value
  emits('update:dialog', value)
}

const displayedAnexos = () => {
  return showAll.value ? anexos.value : anexos.value.slice(0, 2)
}
const getDocFile = async (item) => {
  try {
    loadingFiles[item.idFile] = true; // Inicia o indicador de carregamento para o arquivo específico
    const response = await axios.post('/Document/getDocFile', {
      strHashCode: getToken(),
      docFile: item
    })


    const base64Data = response.data;

    if (base64Data) {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Determine the MIME type based on the file extension
      let extension = item.extension.toLowerCase().replace('.', ''); // Remove any leading dot
      let mimeType;
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'doc':
          mimeType = 'application/msword';
          break;
        case 'docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
          // Add more cases as needed for other file types
        default:
          mimeType = 'application/octet-stream'; // Fallback to a generic binary stream
      }

      const blob = new Blob([byteArray], {type: mimeType});
      const url = window.URL.createObjectURL(blob);

      // Ensure the fileName includes the extension
      let fileName = item.fileName;
      if (!fileName.endsWith(`.${extension}`)) {
        fileName += `.${extension}`;
      }

      // Create a download link and simulate a click to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      // Revoke the object URL after the download is initiated to free up resources
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Invalid base64 data');
    }
  } catch (error) {
    console.error('Erro ao abrir o arquivo:', error);
  } finally {
    loadingFiles[item.idFile] = false; // Para o indicador de carregamento
  }

};


const morOptions = async (item) => {
  switch (item) {
    case 'Delegar': {
      acao.value = 'delegar'
      handleSend(props.documentoResumed.code)
      break
    }
    case 'Recolher':
      acao.value = 'recolher'
      handleSend(props.documentoResumed.code)
      break
    case 'Exportar':
      await exportar()
      break
    case 'Anexos Novos':{
      anexoModal.value = true
      break
    }
  }
}

const exportar = async () => {
  console.log('Exportar', props.documentoResumed)
  await fetch('/Document/getDocumentExternalLink', 'POST', {
    strHashCode: getToken(),
    strDocProcNumber: props.documentoResumed.code,
    strDocRef: ""
  })

  if (statusCode.value === 200) {
    window.open(response.value.parameter, '_blank')
  }
}

const finishDocument = async () => {
  await fetch('/Document/AddMovementToDocumentOutlook', 'POST', {
    strHashCode: getToken(),
    strDocumentNumber: props.documentoResumed.code,
    intIDTeamTo: 0,
    intIDUserTo: 0,
    strDispatch: "",
    intIDWorkflowState: 256,
    strConhecimentos: "",
  })
  if (statusCode.value === 200) {
    sheet.value = false
    localAlterarEstado.value = false
    snackbar.value = true
  }
}

</script>
<template>
  <v-dialog
      :model-value="dialog"
      transition="dialog-bottom-transition"
      fullscreen
      @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-arrow-left" @click="$emit('close', false)"></v-btn>
        <v-toolbar-title>Detalhes</v-toolbar-title>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
                v-for="(item, index) in items"
                :key="index"
                :value="item.title"
            >
              <v-list-item-title
                  v-if="item.isVisible"
                  @click="morOptions(item.title)"
              >{{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>
      <v-list lines="two" subheader>
        <v-card-item>
          <h2 class="font-weight-regular">{{ documentoResumed.code }} - {{ documentoResumed.subject }}</h2>
        </v-card-item>
        <v-card
            title="Documento Principal"
            subtitle="Cheque para ver o documento"
            prepend-icon="mdi-file-document"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            @click="getDocFile(documentoPrincipal)"
            max-width="344"
            rel="noopener"
            target="_blank"
        ></v-card>
        <v-list-subheader>Anexos</v-list-subheader>
        <v-skeleton-loader
            v-if="loading"
            class="mb-2 fixed-width-card bg-white text-black"
            type="list-item-two-line"
        ></v-skeleton-loader>
        <div v-else>
          <v-list-item
              v-for="item in anexos.slice(0, (showAll ? anexos.length : 3))"
              :key="item.idFile"
              v-if="anexos.length > 0"
              link
          >
            <template v-slot:prepend>
              <v-avatar :color="getColorFile(item.extension).color"
                        :icon="getColorFile(item.extension).icon"
              />
            </template>
            <v-list-item-title>
              {{ item.fileName }}
              <v-progress-linear
                  v-if="loadingFiles[item.idFile]"
                  color="cyan"
                  indeterminate
              ></v-progress-linear>
            </v-list-item-title>
            <template v-slot:append>
              <v-list-item-action>
                <v-btn
                    :disabled="loadingFiles[item.idFile]"
                    size="small"
                    color="green-lighten-1"
                    icon="mdi-download" @click="getDocFile(item)"></v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
          <p v-else class="text-center py-2">Nenhum anexo encontrado</p>
          <v-btn
              block
              density="compact"
              elevation="0"
              v-if="anexos.length > 3 && !showAll"
              @click="showAll = true"
          >
            Ver Mais ({{ anexos.length - 3 }})
          </v-btn>
          <v-btn
              block
              density="compact"
              elevation="0"
              v-if="showAll"
              @click="showAll = false"
          >
            Ver Menos
          </v-btn>
        </div>
        <v-divider></v-divider>
        <v-list-subheader>Movimentos</v-list-subheader>
        <v-skeleton-loader
            v-if="loadingMovimentes"
            class="mb-2 fixed-width-card bg-white text-black"
            type="list-item-two-line"
        ></v-skeleton-loader>
        <v-timeline
            v-else
            align="start" side="end">
          <v-timeline-item
              v-for="(item, i) in movimentHistory"
              :key="i"
              :dot-color="getColor(item.movimentHistory1)"
              size="large"
          >
            <template v-slot:icon>
              <v-avatar :color="getColor(item.movimentHistory1)"> {{ getInitials(item.movimentHistory1) }}</v-avatar>
            </template>
            <div class="d-flex justify-space-between flex-grow-1">
              <v-card
                  :title="parseMovimentHistory(item.movimentHistory1).nome"
                  :subtitle="'Para: ' + parseMovimentHistory(item.movimentHistory1).para"
                  :text="parseMovimentHistory(item.movimentHistory1).obs"
                  variant="flat"
              >
                <p class="text-caption pl-2">Data de registro: {{ formatDate(item.dateHistory) }}</p>
              </v-card>
            </div>
          </v-timeline-item>
          <!-- algo par mostrar que lista chegou ao fim -->
          <v-timeline-item
              dot-color="primary"
              size="large"
          >
            <template v-slot:icon>
              <v-avatar color="primary" icon="mdi-circle-slice-8"></v-avatar>
            </template>
          </v-timeline-item>
        </v-timeline>
      </v-list>
    </v-card>
    <v-bottom-sheet
        v-if="localAlterarEstado"
        v-model="sheet">
      <template v-slot:activator="{ props }">
        <div class="text-center">
          <v-fab
              v-bind="props"
              color="success"
              icon="mdi-send"
              class="me-4"
              location="bottom end"
              size="64"
              absolute
              app
              appear
          ></v-fab>
        </div>
      </template>
      <v-list>
        <v-list-subheader>Alterar Estado</v-list-subheader>
        <v-list-item
            prepend-icon="mdi-check"
            title="Concluído"
            @click="finishDocument"
        ></v-list-item>
        <v-list-item
            prepend-icon="mdi-send"
            title="Enviar para Serviço"
            @click="handleSend(documentoResumed.code)"
        ></v-list-item>
      </v-list>
    </v-bottom-sheet>
  </v-dialog>
  <EnviarServicoModal
      @close="sendDialog = false"
      @update:dialog="updateDialog"
      :acao="acao"
      :is-active="sendDialog"
      :str-document-number="strDocumentNumber"
  />
  <anexo-file
      :dialog="anexoModal"
      :documento-resumed="documentoResumed"
      @close="anexoModal = false"
      @update="updateDialog"
  />
  <v-snackbar
      v-model="snackbar"
  >
    Documento concluído com sucesso!

    <template v-slot:actions>
      <v-btn
          color="pink"
          variant="text"
          @click="snackbar = false"
      >
        Fechar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.bg-white {
  background-color: #ffffff !important;
}

.text-black {
  color: #000000 !important;
}
</style>
<!--UAPO/IT/1/2024-->