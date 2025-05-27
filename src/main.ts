import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './style.css';
import App from './App.vue';
import { toastConfig } from './config/toast';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(Toast, toastConfig);
app.mount('#app');
