import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/react',
    options: {},
  },
  core: {
    builder: '@storybook/vite',
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
