<script setup lang="ts">
import AutoComplete from './components/AutoComplete.vue'
</script>

<template>
  <main class="main">
    <AutoComplete />
  </main>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
