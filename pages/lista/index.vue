<script setup>
import TopNavBar from "~/components/layout/TopNavBar.vue";

const tabs = ref(1)

function updateTabs(value) {
  tabs.value = value
}
</script>

<template>
  <TopNavBar
      title="Lista Documentos"
      :pesquisa="false"
      :tabs="tabs"
      :asTabs="false"
      @update:tabs="updateTabs"
  />
</template>

<style scoped>
a {
  background-color: transparent;
  cursor: pointer;
  text-decoration: none;
}
</style>
