<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps(['type', 'label', 'store', 'data'])

const inputName = `searchbar-${props.type}`
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

const showSuggestions = computed(() => props.store.searchValue.length > 2)
const isEmptyResult = computed(() => suggestions.value.length === 0)
const showNoResults = computed(() => showSuggestions.value && isEmptyResult.value)
</script>

<template>
  <div class="wrapper">
    <div class="label-row">
      <label class="label" :for="inputName">{{ props.label }}:</label>
    </div>
    <input
      autofocus
      class="searchbar"
      placeholder="You know what to do.."
      :name="inputName"
      @input="handleChange"
      :value="props.store.searchValue"
      :list="suggestionsId"
    />
    <datalist v-if="showSuggestions" :id="suggestionsId">
      <option v-for="suggestion in suggestions" :key="suggestion" :value="suggestion" />
    </datalist>
    <div class="results">
      <div>Results:</div>
      <div class="no-results-message" v-if="showNoResults">No results found</div>
      <ul v-if="showSuggestions">
        <li v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</li>
      </ul>
      <div v-else>Type at least 3 characters to search...</div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
}

.label-row {
  margin-bottom: 0.2rem;
}

.label {
  text-align: left;
  font-weight: bold;
}

.searchbar {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  width: 100%;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

.no-results-message {
}
</style>
