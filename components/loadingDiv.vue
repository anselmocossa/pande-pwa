
<script setup>
defineProps({
    loading: Boolean
})
</script>


<template>
  <div v-if="loading">
        <v-skeleton-loader
          :loading="loading"
          type="list-item-two-line"
        >
        </v-skeleton-loader>
        <v-skeleton-loader
          :loading="loading"
          type="list-item-two-line"
        >
        </v-skeleton-loader>
        <v-skeleton-loader
          :loading="loading"
          type="list-item-two-line"
        >
        </v-skeleton-loader>
      </div>
</template>