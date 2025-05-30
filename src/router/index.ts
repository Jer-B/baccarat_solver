import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../views/GameView.vue';
import HistoryView from '../views/HistoryView.vue';

const routes = [
  {
    path: '/',
    redirect: '/game',
  },
  {
    path: '/game',
    name: 'Game',
    component: GameView,
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
