// / <reference types="vite/client" />

// Type declarations for CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

// Type declarations for vue-toastification CSS
declare module 'vue-toastification/dist/index.css';
