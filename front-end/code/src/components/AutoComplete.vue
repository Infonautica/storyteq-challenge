<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps(['type', 'label', 'store', 'data'])

const suggestionsId = `suggestions-${props.type}`
const suggestions = ref([])

function isContainingString(mainString: string, subString: string): boolean {
  return mainString.toLowerCase().trim().includes(subString.toLowerCase().trim())
}

function getSuggestions(rawSearchValue: string): string[] {
  const searchValue = rawSearchValue.toLowerCase().trim()

  return props.data.filter((value) => isContainingString(value, searchValue))
}

function handleChange(event: InputEvent) {
  const newValue = event.target.value
  props.store.setSearch(newValue)
  suggestions.value = getSuggestions(newValue)
}

const showSuggestions = computed(() => props.store.searchValue.length > 3)
</script>

<template>
  <div class="wrapper">
    <div class="label-row">
      <label class="label" for="searchbar">{{ props.label }}:</label>
    </div>
    <input
      autofocus
      id="searchbar"
      @input="handleChange"
      :value="props.store.searchValue"
      :list="suggestionsId"
    />
    <datalist v-if="showSuggestions" :id="suggestionsId">
      <option v-for="suggestion in suggestions" :key="suggestion" :value="suggestion" />
    </datalist>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  max-width: 20rem;
}

.label-row {
  margin-bottom: 0.2rem;
}

.label {
  text-align: left;
}

#searchbar {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  width: 100%;
}
</style>
