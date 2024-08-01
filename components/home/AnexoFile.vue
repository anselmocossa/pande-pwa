<script setup lang="ts">
import {ref} from 'vue';
import {getColorFile} from '~/composables/utils.js';

const {fetch, response, statusCode, loading, getToken} = useAxios();
const emit = defineEmits(['update', 'close']);
const props = defineProps({
  dialog: Boolean,
  documentoResumed: Object,
});

const anexos = ref<any[]>([]);
const loadingFiles = ref<{ [key: string]: boolean }>({});
const uploadResults = ref<{ [key: string]: boolean }>({}); // Track upload status for each file
const uploadError = ref(false);

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const files = Array.from(input.files);
    for (const file of files) {
      const base64 = await toBase64(file);
      const idFile = new Date().getTime().toString();
      anexos.value.push({
        idFile,
        fileName: file.name,
        fileBuff: base64.split(',')[1],
        fileExtension: file.name.split('.').pop(),
        strAttachmentName: file.name,
      });
    }
  }
};

const removeFile = (idFile: string) => {
  anexos.value = anexos.value.filter(file => file.idFile !== idFile);
  delete uploadResults.value[idFile]; // Remove the upload status when file is removed
};

const saveFiles = async () => {
  uploadError.value = false; // Reset upload error status
  const failedUploads = [];

  for (const file of anexos.value) {
    loadingFiles.value[file.idFile] = true;
    await fetch('/Document/uploadDocumentAttachmentFromAddinEmail', 'POST', {
      strHashCode: getToken(),
      strDocIDEncrypted: props.documentoResumed.idgdDocument, // Replace with actual value
      intIDGDDocument: 1, // Replace with actual value
      fileBuff: file.fileBuff,
      fileExtension: file.fileExtension,
      strAttachmentName: file.strAttachmentName,
    });

    if (statusCode.value === 200) {
      uploadResults.value[file.idFile] = true; // Mark as successful
    } else {
      uploadResults.value[file.idFile] = false; // Mark as failed
      failedUploads.push(file); // Add to failed uploads list
    }
    loadingFiles.value[file.idFile] = false;
  }

  if (failedUploads.length > 0) {
    anexos.value = failedUploads; // Keep only the files that failed to upload
    uploadError.value = true; // Set upload error status
  } else {
    anexos.value = [];
    emit('close');
  }
};

const close = () => {
  uploadError.value = false;
  anexos.value = [];
  emit('close');
};
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        :model-value="dialog"
        max-width="1200"
    >
      <v-card
          prepend-icon="mdi-file-document"
          title="Anexar Documentos"
      >
        <v-card-text>
          <v-row dense>
            <v-col
                cols="12">
              <v-file-input
                  chips
                  label="File input"
                  multiple
                  variant="outlined"
                  @change="handleFileChange"
              ></v-file-input>
            </v-col>
          </v-row>
          <v-alert
              variant="tonal"
              v-if="uploadError"
              closable
              title="Falha no envio"
              text="Alguns arquivos falharam ao serem enviados."
              type="error"
          ></v-alert>
          <v-list v-if="anexos.length">
            <v-list-item
                v-for="item in anexos"
                :key="item.idFile"
                link
            >
              <template v-slot:prepend>
                <v-avatar :color="getColorFile(item.fileExtension).color"
                          :icon="getColorFile(item.fileExtension).icon"
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
                      color="red-lighten-1"
                      icon="mdi-delete" @click="removeFile(item.idFile)"></v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              class="text-none"
              rounded="xl"
              text="Fechar"
              @click="close"
          ></v-btn>

          <v-btn
              class="text-none"
              color="primary"
              rounded="xl"
              text="Enviar"
              variant="flat"
              :loading="loading"
              @click="saveFiles"
          ></v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
