// Global type declarations for the baccarat assistant project

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'vue-toastification/dist/index.css' {
  const content: string;
  export default content;
}

declare module './style.css' {
  const content: string;
  export default content;
}

// Vue component type declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Additional type declarations for better development experience
declare global {
  interface Window {
    // Add any global window properties if needed
  }
}

export {};
