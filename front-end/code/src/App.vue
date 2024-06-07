<script setup lang="ts">
import AutoComplete from './components/AutoComplete.vue'
import { useCitiesSearchStore, useBooksSearchStore } from './stores/store'

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

const citiesData = getData().cities
const booksData = getData().books.map((book) => `${book.title} by ${book.author}`)

const citiesStore = useCitiesSearchStore()
const booksStore = useBooksSearchStore()
</script>

<template>
  <main class="main">
    <div class="main-half">
      <AutoComplete ype="cities" label="Cities" :data="citiesData" :store="citiesStore" />
    </div>
    <div class="main-half">
      <AutoComplete type="books" label="Books" :data="booksData" :store="booksStore" />
    </div>
  </main>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  padding-top: 5rem;
}

.main-half {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 1rem;
}
</style>
