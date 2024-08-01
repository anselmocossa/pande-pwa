<template>
    <div class="text-center">
        <v-overlay 
            :model-value="overlay" 
            persistent
            class="align-center justify-center">
            <v-progress-circular 
                color="primary" 
                indeterminate size="64"/>
        </v-overlay>
    </div>
</template>

<script setup>
let overlay = ref(true)

const props = defineProps({
  overlay: {
    type: Boolean,
    default: true
  }
})

watch(
  () => props.overlay,
  () => {
    overlay.value = props.overlay
  }
)
</script>