<script setup>
import DocumentDetails from "~/components/home/DocumentDetails.vue";
import {useAxios} from "~/composables/useAxios";
import Swal from "sweetalert2";

const {fetch, getToken, response, loading,statusCode} = useAxios()
const dialog = ref(false)
const movimentHistory = ref([])
const documentoResumed = ref([])
const documentos = ref([])
const anexos = ref([])
const search = ref('')
const searchLoading = ref(false)
const hasSearched = ref(false)

onMounted(async () => {
  // Não carrega documentos automaticamente, apenas quando houver pesquisa
})

const getMyDocuments = async () => {
  const strHashCode = getToken()
  await fetch('MyDocumentsApp/listMyDocumentsApp', 'POST', {
    strHashCode,
    intPageRowSize: 50,
    intCurrentPage: 1
  })
  documentos.value = response.value
  if (response && response.value) {
    const documentPromises = response.value.map(async (item) => {
      try {
        const historyResponse = await fetch('/Document/getDocumentHistoryResumed', 'POST', {
          strHashCode: getToken(),
          strDocumentIDEncrypted: item.idgdDocument
        });

        if (historyResponse) {
          // Ordena por data de movimento e pega a última data
          const sortedHistory = historyResponse.sort((a, b) => new Date(b.dateHistory) - new Date(a.dateHistory));
          item.registryDate = sortedHistory.length > 0 ? sortedHistory[0].dateHistory : null;
        }
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
        item.registryDate = item.deliveredDate
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

// Debounce timer
let searchTimeout = null

const pesquisa = async (value, appliedFilters = []) => {
  // Permite pesquisa vazia para listar todos
  if (value && value.trim().length < 2) {
    return
  }

  marker.value = false
  search.value = value
  searchLoading.value = true
  hasSearched.value = true

  try {
    // Determinar endpoint baseado nos filtros
    let endpoint = 'MyDocumentsApp/listMyDocumentsApp'
    let requestBody = {
      strHashCode: getToken(),
      intPageRowSize: 50,
      intCurrentPage: 1
    }

    // Se há filtro selecionado, usar endpoint específico
    if (appliedFilters !== null && appliedFilters !== undefined && appliedFilters !== '') {
      // Mapeamento de filtros para endpoints
      // 0: Estão Comigo, 1: Estão no Departamento, 2: Tomar Conhecimento
      // 3-7: Outros filtros (podem não estar implementados no backend)
      switch (appliedFilters) {
        case 0: // Estão Comigo
          endpoint = 'MyDocumentsApp/listMyDocumentsApp'
          break
        case 1: // Estão no Departamento
          endpoint = '/MyTeams/listMyTeamDocumentsWithOrder'
          requestBody.intIDTeam = '10533'
          requestBody.strOrder = ''
          break
        case 2: // Tomar Conhecimento
          endpoint = '/Document/listAllMyDocumentsConhecimento'
          requestBody.intDocumentType = 0
          requestBody.intGDBook = 0
          requestBody.strDocumentCode = ''
          requestBody.strWorkflowStateLabel = ''
          requestBody.strEntity = ''
          break
        default:
          // Para outros filtros, usa o endpoint padrão
          // Nota: podem precisar de endpoints específicos a serem implementados
          console.warn('Filtro não implementado:', appliedFilters)
          endpoint = 'MyDocumentsApp/listMyDocumentsApp'
      }
    }

    await fetch(endpoint, 'POST', requestBody)

    if (response && response.value) {
      let filteredDocuments = response.value

      // Filtrar por termo de pesquisa (client-side)
      if (value && value.trim().length > 0) {
        const searchTerm = value.toLowerCase().trim()
        filteredDocuments = filteredDocuments.filter(doc => {
          return (
            (doc.code && doc.code.toLowerCase().includes(searchTerm)) ||
            (doc.subject && doc.subject.toLowerCase().includes(searchTerm)) ||
            (doc.entityDoc && doc.entityDoc.toLowerCase().includes(searchTerm)) ||
            (doc.reference && doc.reference.toLowerCase().includes(searchTerm))
          )
        })
      }

      // Buscar histórico para cada documento (apenas para os primeiros 10)
      const docsToProcess = filteredDocuments.slice(0, 10)
      const documentPromises = docsToProcess.map(async (item) => {
        try {
          const historyResponse = await fetch('/Document/getDocumentHistoryResumed', 'POST', {
            strHashCode: getToken(),
            strDocumentIDEncrypted: item.idgdDocument
          });

          if (historyResponse) {
            // Ordena por data de movimento e pega a última data
            const sortedHistory = historyResponse.sort((a, b) => new Date(b.dateHistory) - new Date(a.dateHistory));
            item.registryDate = sortedHistory.length > 0 ? sortedHistory[0].dateHistory : null;
          }
        } catch (err) {
          console.error('Erro ao buscar histórico do documento:', err)
          // Usa a data de entrega como fallback
          item.registryDate = item.deliveredDate
        }
        return item;
      });

      // Aguarda todas as promessas serem resolvidas
      documentos.value = await Promise.all(documentPromises);
    } else {
      documentos.value = [];
    }
  } catch (error) {
    console.error('Erro ao pesquisar documentos:', error)
    documentos.value = []
  } finally {
    searchLoading.value = false
  }
}

// Função para pesquisa com debounce
const debouncedSearch = (value, filter = null) => {
  // Limpa pesquisa anterior se o campo estiver vazio
  if (!value || value.trim().length === 0) {
    documentos.value = []
    hasSearched.value = false
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    return
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Só pesquisa se tiver pelo menos 2 caracteres
  if (value.trim().length >= 2) {
    searchTimeout = setTimeout(() => {
      pesquisa(value, filter)
    }, 500) // 500ms de delay
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

function sendMessage () {
  resetIcon()
  clearMessage()
}
function clearMessage () {
  message.value = ''
  documentos.value = []
  hasSearched.value = false
  search.value = ''
}
function resetIcon () {
  iconIndex.value = 0
}
function changeIcon () {
  iconIndex.value === icons.value.length - 1
      ? iconIndex.value = 0
      : iconIndex.value++
}

// Filtro selecionado (inicialmente nenhum)
const neighborhoods = ref(null)

// Computed para obter o nome do filtro ativo
const activeFilterName = computed(() => {
  const filterNames = {
    0: 'Estão Comigo',
    1: 'Estão no Departamento',
    2: 'Tomar Conhecimento',
    3: 'Dar Parecer',
    4: 'Passou por Mim',
    5: 'Concluídos',
    6: 'Arquivados',
    7: 'Tomei Conhecimento'
  }
  return neighborhoods.value !== null ? filterNames[neighborhoods.value] : null
})

</script>

<template>
  <layout-top-nav-bar
      :asTabs="false"
  />
  <v-form @submit.prevent="pesquisa(message, neighborhoods)">
      <v-row>
        <v-col cols="12">
          <v-text-field
              v-model="message"
              variant="outlined"
              prepend-inner-icon="mdi-database-search"
              clear-icon="mdi-close-circle"
              label="Pesquisar"
              hint="Digite o que deseja pesquisar: Nº de Registo, Assunto, etc."
              type="text"
              clearable
              :loading="searchLoading"
              :disabled="searchLoading"
              @input="debouncedSearch(message, neighborhoods)"
              @keyup.enter="pesquisa(message, neighborhoods)"
              @click:clear="clearMessage"
          >
            <template v-slot:append-inner>
              <v-badge
                  :content="neighborhoods !== null ? '1' : '0'"
                  :model-value="neighborhoods !== null"
                  color="primary"
                  dot
              >
                <v-icon
                    @click="marker = !marker"
                    style="cursor: pointer"
                >
                  mdi-filter-variant
                </v-icon>
              </v-badge>
            </template>
          </v-text-field>
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
            <div class="text-h6">Filtrar por tópicos</div>

            <div class="text-subtitle-1">Selecione um tópico para filtrar os documentos</div>

            <v-responsive
                class="overflow-y-auto"
                max-height="280">
              <v-chip-group
                  v-model="neighborhoods"
                  column
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
                    text="Dar Parecer (em breve)"
                    variant="outlined"
                    filter
                    disabled
                ></v-chip>

                <v-chip
                    text="Passou por Mim (em breve)"
                    variant="outlined"
                    filter
                    disabled
                ></v-chip>

                <v-chip
                    text="Concluídos (em breve)"
                    variant="outlined"
                    filter
                    disabled
                ></v-chip>

                <v-chip
                    text="Arquivados (em breve)"
                    variant="outlined"
                    filter
                    disabled
                ></v-chip>

                <v-chip
                    text="Tomei Conhecimento (em breve)"
                    variant="outlined"
                    filter
                    disabled
                ></v-chip>
              </v-chip-group>
            </v-responsive>
          </div>
          <div class="pa-2">
            <v-row dense>
              <v-col cols="6">
                <v-btn
                    color="grey"
                    rounded="t-0 b-xl"
                    size="large"
                    variant="outlined"
                    block
                    @click="neighborhoods = null; marker = false"
                >
                  Limpar
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                    color="primary"
                    rounded="t-0 b-xl"
                    size="large"
                    variant="flat"
                    block
                    @click="pesquisa(message, neighborhoods)"
                >
                  Aplicar
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-sheet>
    </template>
  </v-dialog>

  <!-- Loading state -->
  <div v-if="searchLoading" class="text-center mt-10">
    <v-progress-circular
        indeterminate
        color="primary"
        size="64"
    ></v-progress-circular>
    <p class="mt-4 text-body-1">Pesquisando documentos...</p>
  </div>

  <!-- Resultados da pesquisa -->
  <div v-else-if="documentos.length > 0 && hasSearched">
    <v-alert
        type="info"
        variant="tonal"
        class="mb-4"
        density="comfortable"
    >
      <div class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between ga-2">
        <div>
          <div class="text-body-2">
            Encontrados <span class="font-weight-bold">{{ documentos.length }}</span> documento(s)
          </div>
          <div v-if="activeFilterName" class="text-caption text-medium-emphasis mt-1">
            Filtrado por: {{ activeFilterName }}
          </div>
        </div>
        <v-chip
            v-if="activeFilterName"
            size="small"
            color="primary"
            variant="flat"
            closable
            @click:close="neighborhoods = null; pesquisa(message, null)"
        >
          <v-icon start size="small">mdi-filter</v-icon>
          {{ activeFilterName }}
        </v-chip>
      </div>
    </v-alert>

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
          <v-btn color="primary" variant="text" @click.stop="handleReadMore(item.idgdDocument)">
            Ler Mais
          </v-btn>
          <v-btn color="primary" variant="text">Delegar</v-btn>
        </div>
      </template>
    </v-card>
  </div>

  <!-- Empty state - Nenhuma pesquisa feita -->
  <v-empty-state
      class="mt-10"
      color="blue"
      v-else-if="!hasSearched"
      icon="mdi-file-document-multiple-outline"
      title="Pesquise por documentos"
      text="Digite no campo acima para pesquisar documentos por número de registo, assunto, etc."
  ></v-empty-state>

  <!-- Empty state - Pesquisa sem resultados -->
  <v-empty-state
      class="mt-10"
      color="orange"
      v-else
      icon="mdi-file-document-remove-outline"
      title="Nenhum documento encontrado"
      text="Não foram encontrados documentos com os critérios de pesquisa informados. Tente usar termos diferentes."
  ></v-empty-state>

  <DocumentDetails
      :dialog="dialog"
      :movimentHistory="movimentHistory"
      :documentoResumed="documentoResumed"
      :anexos="anexos"
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
