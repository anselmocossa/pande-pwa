<script setup>
import {defineEmits, defineProps, ref, watch} from 'vue';
import {useAxios} from "~/composables/useAxios";

const emits = defineEmits(['update:dialog', 'close'])
const {fetch, getToken, response, statusCode, loading} = useAxios()
const teamTo = ref([])
const userTo = ref([])
const props = defineProps({
  isActive: {
    type: Boolean,
    required: true
  },
  strDocumentNumber: {
    type: String,
    required: true
  },
  acao: {
    type: String,
    default: 'enviar'
  }
});
const form = ref({
  idTeam: '',
  idUser: '',
  idConhecimentos: [],
  strObservations: ''
})

const erros = ref({
  idTeam: '',
  idUser: '',
  strObservations: ''
})


onMounted(async () => {
  await getTeamTo()
  await getUserTo()
  console.log('Tomar conhecimento' + props.acao)
})

const getTeamTo = async () => {
  await fetch('/Workflow/listWorkflowTeamTo', 'POST', {
    strHashCode: getToken(),
    intWorkflowStateToID: "254",
    strFilterGroupName: ""
  })
  teamTo.value = response.value
}

const getUserTo = async (idTeam = 0) => {
  await fetch('/Workflow/listWorkflowUsersTo', 'POST', {
    strHashCode: getToken(),
    intWorkflowStateToID: "254",
    intIDTeam: idTeam
  })
  userTo.value = response.value
}

const onSave = async () => {
  if (!validateForm()) {
    return
  }

  const  conhecer = async () => {
    await fetch('/Document/AddMovementToDocumentOutlook', 'POST', {
      strHashCode: getToken(),
      strDocumentNumber: props.strDocumentNumber,
      intIDTeamTo: 0,
      intIDUserTo: 0,
      strDispatch: 'Movimento automático (Conhecimento de Documento) - '+ form.value.strObservations,
      intIDWorkflowState: 254,
      strConhecimentos: getConhecimentos(),
    })
    if (statusCode.value === 200) {
      emits('update:dialog', false)
    }
  }

  switch (props.acao) {
    case 'enviar':
      await enviar()
      break
    case 'delegar':
      await delegar()
      break
    case 'recolher':
      await recolher()
      break
    case 'conhecer':
      await conhecer()
      break
  }
}

const enviar = async () => {
  await fetch('/Document/AddMovementToDocumentOutlook', 'POST', {
    strHashCode: getToken(),
    strDocumentNumber: props.strDocumentNumber,
    intIDTeamTo: form.value.idTeam ? form.value.idTeam : 0,
    intIDUserTo: form.value.idUser ? form.value.idUser : 0,
    strDispatch: form.value.strObservations,
    intIDWorkflowState: 254,
    strConhecimentos: getConhecimentos(),
  })
  if (statusCode.value === 200) {
    emits('update:dialog', false)
  }
}

const delegar = async () => {
  await fetch('/Document/AddMovementToDocumentOutlook', 'POST', {
    strHashCode: getToken(),
    strDocumentNumber: props.strDocumentNumber,
    intIDTeamTo: form.value.idTeam ? form.value.idTeam : 0,
    intIDUserTo: form.value.idUser ? form.value.idUser : 0,
    strDispatch: 'Movimento automático (Delegação de Documento) - '+ form.value.strObservations,
    intIDWorkflowState: 254,
    strConhecimentos: getConhecimentos(),
  })
  if (statusCode.value === 200) {
    emits('update:dialog', false)
  }
}

const recolher = async () => {
  await fetch('/Document/AddMovementToDocumentOutlook', 'POST', {
    strHashCode: getToken(),
    strDocumentNumber: props.strDocumentNumber,
    intIDTeamTo: form.value.idTeam ? form.value.idTeam : 0,
    intIDUserTo: form.value.idUser ? form.value.idUser : 0,
    strDispatch: form.value.strObservations,
    intIDWorkflowState: 254,
    strConhecimentos: getConhecimentos(),
  })
  if (statusCode.value === 200) {
    emits('update:dialog', false)
  }
}


const getConhecimentos = () => {
  if (form.value.idConhecimentos.length === 0) {
    return ''
  }
  return form.value.idConhecimentos.join(',');
}
const validateForm = () => {
  // a pessoa deve selevionar um grupo ou um funcionario
  let isValid = true
  if (form.value.idTeam === '' && form.value.idUser === '') {
    erros.value.idTeam = 'Selecione um grupo ou um funcionário'
    erros.value
    isValid = false
  } else {
    erros.value.idTeam = ''
  }
  return isValid
}
</script>

<template>
  <v-bottom-sheet
      :model-value="isActive"
      @update:model-value="$emit('close')"
      max-width="500"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <div
            v-if="acao === 'enviar'"
            class="text-h5 text-medium-emphasis ps-2">
          Enviar para Serviço
        </div>
        <div
            v-if="acao === 'delegar'"
            class="text-h5 text-medium-emphasis ps-2">
          Nova delegação de documento
        </div>
        <div
            v-if="acao === 'recolher'"
            class="text-h5 text-medium-emphasis ps-2">
          Recolher documento
        </div>
        <div
            v-if="acao === 'conhecer'"
            class="text-h5 text-medium-emphasis ps-2">
          Tomei conhecimento
        </div>
        <v-btn
            icon="mdi-close"
            variant="text"
            @click="$emit('close')"
        ></v-btn>
      </v-card-title>

      <v-divider class="mb-4"></v-divider>
      <v-card-text>
        <div v-if="acao === 'enviar' || acao === 'delegar'">
          <div class="mb-2">Funcionário Destino</div>
          <v-autocomplete
              clearable
              v-model="form.idUser"
              :items="userTo"
              item-title="userFullName"
              item-value="idUser"
              variant="outlined"
              :error-messages="erros.idTeam"
          ></v-autocomplete>

          <div class="mb-2">Grupo Destino</div>
          <v-autocomplete
              clearable
              v-model="form.idTeam"
              :items="teamTo"
              item-title="teamName"
              item-value="idTeam"
              variant="outlined"
          ></v-autocomplete>
        </div>
        <div v-if="acao === 'enviar'">
          <div class="mb-2">Conhecimentos
          </div>
          <v-autocomplete
              v-if="acao === 'enviar'"
              v-model="form.idConhecimentos"
              :items="userTo"
              color="blue-grey-lighten-2"
              item-title="userFullName"
              item-value="idUser"
              variant="outlined"
              chips
              closable-chips
              multiple
          >
          </v-autocomplete>
        </div>
        <div class="mb-2">Observações</div>
        <v-textarea
            v-model="form.strObservations"
            :counter="900"
            class="mb-2"
            rows="2"
            variant="outlined"
            persistent-counter
            :error-messages="erros.strObservations"
        ></v-textarea>


        <div
            v-if="acao === 'enviar' || acao === 'delegar'"
            class="text-overline mb-2">
          <v-icon color="primary">mdi-information</v-icon>
          Nota
        </div>

        <div
            v-if="acao === 'enviar'"
            class="text-medium-emphasis mb-1">
          Para enviar o documento, selecione um grupo ou um funcionário destino.
          Certifique-se de escolher uma opção adequada para garantir a entrega correta.
        </div>
        <div
            v-if="acao === 'delegar'"
            class="text-medium-emphasis mb-1">
          Ao gravar será registado um movimento.
          O mesmo pode ser consultado no separador "Movimentos".
        </div>
      </v-card-text>

      <v-divider class="mt-2"></v-divider>

      <v-card-actions class="my-2 d-flex justify-end">
        <v-btn
            class="text-none"
            rounded="xl"
            text="Cancelar"
            @click="$emit('close')"
        ></v-btn>

        <v-btn
            class="text-none"
            color="primary"
            rounded="xl"
            text="Enviar"
            :loading="loading"
            variant="flat"
            @click="onSave"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
