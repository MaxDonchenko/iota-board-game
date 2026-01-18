import type { Meta, StoryObj } from '@storybook/react';
import { SimpleList } from './SimpleList';

const meta: Meta<typeof SimpleList> = {
  title: 'Components/Info/SimpleList',
  component: SimpleList,
};

export default meta;
type Story = StoryObj<typeof SimpleList>;

export const Default: Story = {
  args: {
    title: 'Tips & Tricks',
    items: [
      'Pick a card from the list above',
      'Click any empty spot on the board to place it',
      'Right-click (or long press) a card on the board to remove it',
      'Add cards to player hands using "Add Selected"',
    ],
  },
};

export const WithoutTitle: Story = {
  args: {
    items: [
      'Item 1',
      'Item 2 with a longer description that should wrap properly if the container is small enough.',
      'Item 3',
    ],
  },
};
