import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import { createPinia } from 'pinia';
import persistedState from 'pinia-plugin-persistedstate';
import router from '../src/router';
// Import global styles
import '../src/assets/styles/main.css';

// Setup Vue application with global plugins and components
const pinia = createPinia();
pinia.use(persistedState);
setup(app => {
  app.use(pinia).use(router);
  // Add any global components, directives, or plugins here
  // app.component('GlobalComponent', GlobalComponent);
  // app.directive('custom-directive', customDirective);
  // app.use(SomePlugin);
});

const preview: Preview = {
  parameters: {
    // Enhanced actions configuration
    actions: {
      argTypesRegex: '^on[A-Z].*',
      handles: ['mouseover', 'click', 'focus', 'blur'],
    },

    // Enhanced controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    // Enhanced docs configuration for Storybook 9
    docs: {
      toc: {
        contentsSelector: '.sbdocs-content',
        headingSelector: 'h1, h2, h3',
        ignoreSelector: '#storybook-docs',
        title: 'Table of Contents',
        disable: false,
        unsafeTocbotOptions: {
          orderedList: false,
        },
      },
      source: {
        language: 'typescript',
        format: 'dedent',
      },
    },

    // Comprehensive viewport configuration
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '667px' },
          type: 'mobile',
        },
        mobileLarge: {
          name: 'Mobile Large (414px)',
          styles: { width: '414px', height: '896px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        tabletLarge: {
          name: 'Tablet Large (1024px)',
          styles: { width: '1024px', height: '768px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '720px' },
          type: 'desktop',
        },
        desktopLarge: {
          name: 'Large Desktop (1920px)',
          styles: { width: '1920px', height: '1080px' },
          type: 'desktop',
        },
      },
      defaultViewport: 'desktop',
    },

    // Enhanced backgrounds with theme support
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'luxury', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' },
        { name: 'elite', value: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #0d0d0d 100%)' },
      ],
    },

    // Layout configuration
    layout: 'centered',

    // Options for better development experience
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Common', 'UI', 'Examples'],
      },
    },
  },

  // Global types for toolbar controls
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'luxury',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'luxury', title: 'Luxury Theme', icon: 'star' },
          { value: 'elite', title: 'Elite Theme', icon: 'diamond' },
        ],
        dynamicTitle: true,
        showName: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English', right: '🇺🇸' },
          { value: 'es', title: 'Español', right: '🇪🇸' },
          { value: 'fr', title: 'Français', right: '🇫🇷' },
        ],
        dynamicTitle: true,
      },
    },
  },

  // Enhanced decorators with better theme and context handling
  decorators: [
    (story, context) => {
      const theme = context.globals.theme || 'luxury';
      const locale = context.globals.locale || 'en';

      return {
        template: `
          <div 
            :data-theme="theme" 
            :data-locale="locale"
            class="storybook-wrapper"
            :class="[\`theme-\${theme}\`, \`locale-\${locale}\`]"
          >
            <story />
          </div>
        `,
        data() {
          return { theme, locale };
        },
      };
    },
  ],

  // Tags for story organization (Storybook 9 feature)
  tags: ['autodocs'],
};

export default preview;
