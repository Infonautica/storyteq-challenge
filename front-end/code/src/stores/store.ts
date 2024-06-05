import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCitiesSearchStore = defineStore('citiesSearch', () => {
  const searchValue = ref('')

  function setSearch(newValue: string) {
    searchValue.value = newValue
  }

  return { searchValue, setSearch }
})

export const useBooksSearchStore = defineStore('booksSearch', () => {
  const searchValue = ref('')

  function setSearch(newValue: string) {
    searchValue.value = newValue
  }

  return { searchValue, setSearch }
})
