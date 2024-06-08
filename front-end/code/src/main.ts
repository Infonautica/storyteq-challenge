import './assets/main.css'

import { Application } from '@splinetool/runtime'

const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement
const spline = new Application(canvas)
spline.load('https://prod.spline.design/YVXsq0Oc1i0I9hF0/scene.splinecode')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
