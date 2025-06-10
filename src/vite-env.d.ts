/// <reference types="vite/client" />

// Type declarations for CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

// Type declarations for vue-toastification CSS
declare module 'vue-toastification/dist/index.css';

// Environment variable typing for Vite
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Container Generator types - temporarily commented out while focusing on session control

// declare module '@/types/core/containerGeneratorTypes' {
//   export * from '@/types/core/containerGeneratorTypes';
// }

// declare module '@/composables/useContainerGenerator' {
//   export * from '@/composables/useContainerGenerator';
// }

// declare module '@/components/common/CDDContainerGenerator.vue' {
//   import { DefineComponent } from 'vue';
//   const component: DefineComponent<{}, {}, any>;
//   export default component;
// }
