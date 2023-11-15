import type { Meta, StoryObj } from "@storybook/react";

import MultipleStep from "./MultipleStep";

const meta: Meta<typeof MultipleStep> = {
  title: "Nance Components/MultipleStep",
  component: MultipleStep,
};

export default meta;
type Story = StoryObj<typeof MultipleStep>;

export const ThreeSteps: Story = {
  args: {
    steps: [
      {
        name: "First step",
        content: <p>First step content</p>,
      },
      {
        name: "Second step",
        content: <p>Second step content</p>,
      },
      {
        name: "Third step",
        content: <p>Third step content</p>,
      },
    ],
  },
};
