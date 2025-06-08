import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './style.css';
// Import CDD Design System styles
import './assets/styles/main.css';
import App from './App.vue';
import router from './router';
import { toastConfig } from './config/toast';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(Toast, toastConfig);
app.mount('#app');
