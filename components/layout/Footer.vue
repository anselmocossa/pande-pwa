<template>
  <v-bottom-navigation app>
    <v-btn
        v-for="link in linksFooter"
        :key="link.id"
        :to="link.url"
        icon=""
    >
      <v-badge color="error"
               v-if="link.content > 0"
               :content="link.content > 99 ? '99+' : link.content">
        <v-icon>{{ link.icon }}</v-icon>
      </v-badge>
      <v-icon v-else>{{ link.icon }}</v-icon>
      <span>{{ link.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
const props = defineProps({
  linksFooter: {
    type: Array,
    default: [],
  },
});
</script>