/* global pendo */
import { createApp } from 'vue'
import App from './App.vue'

// Boot Pendo once with an anonymous visitor. An empty id lets the SDK resolve
// a returning visitor from cookies/localStorage, otherwise it creates a new one.
pendo.initialize({
  visitor: {
    id: ''
  }
})

createApp(App).mount('#app') 