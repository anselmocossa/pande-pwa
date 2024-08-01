<script setup>
import DocumentDetails from "~/components/home/DocumentDetails.vue";
import {useAxios} from "~/composables/useAxios";
import {useRouter} from "vue-router";
import Swal from "sweetalert2";

const {fetch, getToken, response, loading} = useAxios()
const router = useRouter()
const dialog = ref(false)
const movimentHistory = ref([])
const documentoResumed = ref([])
const documentos = ref([])
const anexos = ref([])
const search = ref('')

onMounted(async () => {
  await getMyDocuments()
})

const getMyDocuments = async () => {
  const strHashCode = getToken()
  await fetch('MyDocumentsApp/listAllMyDocuments', 'POST', {
    strHashCode,
    intPageRowSize: '30',
    intCurrentPage: '1',
    strSearch: ''
  })
  documentos.value = response.value
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

const handleReadMore = async (id) => {
  dialog.value = true
  await fetch('/Document/getDocumentHistoryResumed', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: id
  })
  movimentHistory.value = response.value.sort((a, b) => new Date(b.dateHistory) - new Date(a.dateHistory))
  await fetch('/Document/getDocumentDataResumed', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: id
  })
  documentoResumed.value = response.value
  await fetch('/Document/listDocumentFiles', 'POST', {
    strHashCode: getToken(),
    strDocumentIDEncrypted: id
  })
  anexos.value = response.value
}

const onScroll = (e) => {
  onScroll.valeu = e.target.scrollTop
}

const updateDialog = async (value) => {
  dialog.value = value
  await getMyDocuments()
  await Swal.fire({
    title: 'Documento enviado com sucesso!',
    icon: 'success',
    showConfirmButton: false,
    timer: 1500
  })
}

const pesquisa = async (value) => {
  search.value = value
  await fetch('MyDocumentsApp/listAllMyDocuments', 'POST', {
    strHashCode: getToken(),
    intPageRowSize: '30',
    intCurrentPage: '1',
    strSearch: value
  })
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


const message = ref('')
    const marker = ref()
    const iconIndex = ref(0)
    const icons = ref([
  'mdi-emoticon',
  'mdi-emoticon-cool',
  'mdi-emoticon-dead',
  'mdi-emoticon-excited',
  'mdi-emoticon-happy',
  'mdi-emoticon-neutral',
  'mdi-emoticon-sad',
  'mdi-emoticon-tongue',
])

function toggleMarker () {
  this.marker = !this.marker
}
function sendMessage () {
  resetIcon()
  clearMessage()
}
function clearMessage () {
  message.value = ''
}
function resetIcon () {
  iconIndex.value = 0
}
function changeIcon () {
  iconIndex.value === icons.value.length - 1
      ? iconIndex.value = 0
      : iconIndex.value++
}


const amenities = ref([1, 4])
const neighborhoods = ref([1])
const topics = ref( [
  '🎤 Advice',
  '🐕 Animals',
  '🤖 Anime',
  '🎨 Art & Design',
  '💄 Beauty',
  '🏢 Business',
  '📚 Books',
  '💡 Damn That\'s Interesting',
  '💃 Hobbies',
  '🎮 Gaming',
  '🎥 Movies',
  '🎵 Music',
  '📺 TV',
  '🌮 Food',
  '😂 Funny',
  '💖 Health & Lifestyle',
  '🎓 School',
  '📰 News',
  '🌲 Nature',
  '🎨 Photography',
  '🎏 Sports',
])
</script>

<template>
  <layout-top-nav-bar
      title="Pesquisa"
      @pesquisa="search"
      :pesquisa="false"
      :loading="loading"
  />
  <v-form>
      <v-row>
        <v-col cols="12">
          <v-text-field
              v-model="message"
              variant="outlined"
              prepend-inner-icon="mdi-database-search"
              append-inner-icon="mdi-filter-variant"
              clear-icon="mdi-close-circle"
              label="Pesquisar"
              hint="Digite o que deseja pesquisar: Nº de Registo, Assunto, etc."
              type="text"
              clearable
              @click:append="sendMessage"
              @click:append-inner="marker = !marker"
              @click:clear="clearMessage"
          ></v-text-field>
        </v-col>
      </v-row>
  </v-form>
  <v-dialog
      v-model="marker"
      max-width="500">
    <template v-slot:default="{ isActive }">
        <v-sheet
            class="mx-auto"
            max-width="400"
            rounded="xl"
            border
        >
          <div class="pa-4">
            <div class="text-h6">Filter por tópicos</div>

            <div class="text-subtitle-1">Selecione os tópicos que deseja filtrar</div>

            <v-responsive
                class="overflow-y-auto"
                max-height="280">
              <v-chip-group
                  v-model="neighborhoods"
                  column
                  multiple
              >
                <v-chip
                    text="Estão Comigo"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Estão no Departamento"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Tomar Conhecimento"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Dar Parecer"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Passou por Mim"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Concluídos"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Arquivados"
                    variant="outlined"
                    filter
                ></v-chip>

                <v-chip
                    text="Tomei Conhecimento"
                    variant="outlined"
                    filter
                ></v-chip>
              </v-chip-group>
            </v-responsive>
          </div>
          <div class="pa-2"><v-btn
                color="primary"
                rounded="t-0 b-xl"
                size="x-large"
                text="Continue"
                variant="flat"
                block
            ></v-btn>
          </div>
        </v-sheet>
    </template>
  </v-dialog>

  <div v-if="documentos.length > 0 && search.length > 2">
    <v-card
        v-for="item in documentos"
        :key="item.code"
        :title="item.subject"
        :subtitle="item.code"
        @click="handleReadMore(item.idgdDocument)"
        class="mb-2 fixed-width-card bg-white text-black"
        density="compact"
        variant="text"
        border="1"
    >
      <template v-slot:actions>
        <div class="d-flex justify-end align-center w-100 p-0">
          <p class="text-caption mr-4">
            Data de entrega: {{ item.registryDate }}
          </p>
          <v-btn color="primary" variant="text" @click="$emit('read-more', item.idgdDocument)">
            Ler Mais
          </v-btn>
          <v-btn color="primary" variant="text">Delegar</v-btn>
        </div>
      </template>

    </v-card>
  </div>
  <v-empty-state
      class="mt-10"
      color="blue"
      v-else-if="!loading"
      icon="mdi-text-box-search-outline"
      title="Lista de documentos vazia"
  ></v-empty-state>

  <DocumentDetails
      :dialog="dialog"
      :movimentHistory="movimentHistory"
      :documentoResumed="documentoResumed"
      :aneos="anexos"
      :alterar-estado="false"
      @close="dialog = false"
      @update:dialog="updateDialog"
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
