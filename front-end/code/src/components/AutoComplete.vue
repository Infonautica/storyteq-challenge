<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCitiesSearchStore, useBooksSearchStore } from '../stores/store'

const citiesStore = useCitiesSearchStore()
const booksStore = useBooksSearchStore()

function getData() {
  const cities = [
    'san jose',
    'santiago',
    'san francisco',
    'santa rosa',
    'san juan',
    'sabadell',
    'salamanca',
    'salt lake city',
    'salinas',
    'salem',
    'sausalito',
    'taipei',
    'tel aviv',
    'tempe',
    'termez',
    'temuco',
    'tiajuna',
    'tieling',
    'thousand oaks',
    'thunder bay',
    'tokyo',
    'tulsa'
  ]

  const books = [
    {
      title: 'Don Quixote',
      author: 'Miguel De Cervantes'
    },
    {
      title: "Pilgrim's Progress",
      author: 'John Bunyan'
    },
    {
      title: 'Robinson Crusoe',
      author: 'Daniel Defoe'
    },
    {
      title: "Gulliver's Travels",
      author: 'Jonathan Swift'
    },
    {
      title: 'Tom Jones',
      author: 'Henry Fielding'
    },
    {
      title: 'Clarissa',
      author: 'Samuel Richardson'
    },
    {
      title: 'Tristram Shandy',
      author: 'Laurence Sterne'
    }
  ]

  return { cities, books }
}

const suggestions = ref([])

function isContainingString(mainString: string, subString: string): boolean {
  return mainString.toLowerCase().trim().includes(subString.toLowerCase().trim())
}

function getSuggestions(rawSearchValue: string): string[] {
  const searchValue = rawSearchValue.toLowerCase().trim()

  const { cities, books } = getData()

  const filteredCities = cities.filter((city) => isContainingString(city, searchValue))
  const filteredBooks = books.filter((book) => isContainingString(book.title, searchValue))

  return [...filteredCities, ...filteredBooks]
}

function handleChange(event: InputEvent) {
  const newValue = event.target.value
  searchStore.setSearch(newValue)
  suggestions.value = getSuggestions(newValue)
}

const showCitiesSuggestions = computed(() => citiesStore.searchValue.length > 3)
</script>

<template>
  <div class="wrapper">
    <div class="label-row">
      <label class="label" for="searchbar">You know what to do:</label>
    </div>
    <input
      autofocus
      id="searchbar"
      @input="handleChange"
      :value="searchStore.searchValue"
      list="cities-suggestions"
    />
    <datalist v-if="showCitiesSuggestions" id="cities-suggestions">
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
