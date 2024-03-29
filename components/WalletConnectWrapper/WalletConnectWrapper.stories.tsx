import type { Meta, StoryObj } from "@storybook/react";

import { createMock } from "storybook-addon-module-mock";
import * as nextAuth from "next-auth/react";

import WalletConnectWrapper from "./WalletConnectWrapper";

const meta: Meta<typeof WalletConnectWrapper> = {
  title: "Nance Components/WalletConnectWrapper",
  component: WalletConnectWrapper,
};

export default meta;
type Story = StoryObj<typeof WalletConnectWrapper>;

const mockedUpdate = async (data: any) => {
  return null;
};

export const Unauthenticated: Story = {
  args: {
    children: <p>Placeholder</p>,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(nextAuth, "useSession");
        mock.mockReturnValue({
          data: null,
          status: "unauthenticated",
          update: mockedUpdate,
        });

        return [mock];
      },
    },
  },
};

export const Loading: Story = {
  args: {
    children: <p>Placeholder</p>,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(nextAuth, "useSession");
        mock.mockReturnValue({
          data: null,
          status: "loading",
          update: mockedUpdate,
        });

        return [mock];
      },
    },
  },
};

export const Authenticated: Story = {
  args: {
    children: <p>Placeholder</p>,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(nextAuth, "useSession");
        mock.mockReturnValue({
          data: {
            expires: "",
          },
          status: "authenticated",
          update: mockedUpdate,
        });

        return [mock];
      },
    },
  },
};
