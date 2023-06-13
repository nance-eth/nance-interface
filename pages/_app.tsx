import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { useState, useEffect } from 'react';
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

import {
  getDefaultWallets,
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  AuthenticationStatus,
  createAuthenticationAdapter
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig, createClient,
  configureChains, chain
} from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'

import { NextQueryParamProvider } from 'next-query-params';

import { JuiceProvider } from 'juice-hooks'
import { Flowbite } from 'flowbite-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

import { getAuthStatus, getNanceNonce, postNanceVerify } from '../hooks/NanceHooks';
import { SiweMessage } from 'siwe';

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql',
  cache: memCache({ size: 200 })
})

// WAGMI and RainbowKit configuration
const { chains, provider } = configureChains(
  [chain.mainnet],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY }),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const theme = {
  theme: {
    tooltip: {
      target: '',
      content: 'relative z-20 max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px] break-words'
    }
  }
}

function MyApp({ Component, pageProps }) {
  const [authenticationStatus, setAuthenticationStatus] = useState('loading');

  useEffect(() => {
    const loadAuthenticationStatus = async () => {
      try {
        const status = await getAuthStatus();
        if (status.data === 'unauthenticated') {
          setAuthenticationStatus('unauthenticated');
        } else {
          setAuthenticationStatus('authenticated');
        }
      } catch (error) {
        console.error('Error loading authentication status:', error);
        setAuthenticationStatus('unauthenticated');
      }
    };
    loadAuthenticationStatus();
  }, []);

  const authenticationAdapter = createAuthenticationAdapter({
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
      console.debug("rainbow", res)

      // update status in App component so RainbowKit can know
      setAuthenticationStatus(
        res.success ? 'authenticated' : 'unauthenticated'
      );

      if (res.success) return true;
      return false;
    },
    signOut: async () => {
      await fetch('/api/logout');
    },
  });  

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={authenticationStatus as AuthenticationStatus}
        >
          <RainbowKitProvider
            chains={chains}
            appInfo={{
              appName: 'JBDAO',
              learnMoreUrl: 'https://jbdao.org',
            }}>
            <ClientContext.Provider value={graphqlClient}>
              <NextQueryParamProvider>
                <JuiceProvider provider={wagmiClient.provider}>
                  <Flowbite theme={theme}>
                    <ErrorBoundary>
                      <Component {...pageProps} />
                    </ErrorBoundary>
                  </Flowbite>
                </JuiceProvider>
              </NextQueryParamProvider>
            </ClientContext.Provider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </WagmiConfig>
      <Analytics />
    </>
  )
}

export default MyApp
