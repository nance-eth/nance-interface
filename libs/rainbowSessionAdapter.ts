import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { getNanceNonce, postNanceVerify } from '../hooks/NanceHooks';

export const authenticationAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    return getNanceNonce();
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to Nance',
      uri: 'http://localhost:3001',
      version: '1',
      chainId,
      nonce,
    });
  },
  getMessageBody: ({ message }) => {
    return message.prepareMessage();
  },
  verify: async ({ message, signature }) => {
    const res = await postNanceVerify(message, signature);
    if (res.success) return true;
    return false;
  },
  signOut: async () => {
    await fetch('/api/logout');
  },
});
