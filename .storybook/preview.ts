import type { Preview } from '@storybook/react';
import '../src/styles/index.css';
import '../src/styles/themes.css';
import '../src/styles/card-animations.css';

// Override Storybook's fixed background to respect theme
const style = document.createElement('style');
style.textContent = `
  .sb-show-main {
    background: var(--bg-primary) !important;
    transition: background-color 0.3s ease !important;
  }
`;
document.head.appendChild(style);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Sync Storybook theme with game theme
      const storybookTheme = (context.globals.theme || 'light') as 'light' | 'dark';
      document.documentElement.setAttribute('data-theme', storybookTheme);

      return Story();
    },
  ],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
