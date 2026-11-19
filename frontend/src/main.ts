import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initTheme } from './composables/useTheme';
import './assets/main.css';

// Initialize theme before mounting Vue to prevent flash of unstyled/wrong theme
initTheme();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
