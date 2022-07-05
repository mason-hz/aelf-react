# `aelf-react`

- [`aelf-react`](#aelf-react)
  - [Overview](#overview)
  - [Install](#install)
  - [`aelf-react@core` API Reference](#aelf-reactcore-api-reference)
    - [AElfReactProvider](#aelfreactprovider)
      - [Props](#props)
      - [Example](#example)
      - [Multi node](#multi-node)
    - [useAElfReact](#useaelfreact)
      - [Example](#example-1)
    - [Notice](#notice)
    - [Example of use](#example-of-use)

## Overview

At a high level, `aelf-react` is a state machine which ensures that certain key pieces of data (the user's current account, for example) relevant to your dApp are kept up-to-date. To this end, `aelf-react` uses [Context](https://reactjs.org/docs/context.html) to efficiently store this data, and inject it wherever you need it in your application.

The data conforms to the following interface:

```typescript
export interface AElfContextState {
  name?: string;
  chainId?: string;
  account?: AElfAddress;
  defaultAElfBridge?: AElfDappBridge;
  aelfBridges?: { [key: string]: AElfDappBridge };
  nodes?: AElfReactProviderProps['nodes'];
  pubKey?: string;
  publicKey?: PublicKey;
  // is connected
  isActive: boolean;
}

export interface AElfContextType extends AElfContextState {
  /**
   * The activate connection can optionally pass in a new node
   * @param nodes - @see AElfReactProviderProps.nodes
   */
  activate: (nodes?: AElfReactProviderProps['nodes']) => Promise<true | any>;
  // deactivate connection
  deactivate: () => Promise<true | any>;
}
```

## Install

`react @>= 16.8`

```bash
yarn add @aelf-react/core

# OR

npm install --save @aelf-react/core
```
## `aelf-react@core` API Reference

### AElfReactProvider

`aelf-react` relies on the existence of a `AElfReactProvider` at the root of your application (or more accurately, at the root of the subtree which you'd like to have web3 functionality).

#### Props

```typescript
export type AelfNode = {
  rpcUrl: string;
  chainId: string;
};

/**
 * @param children - A React subtree that needs access to the context.
 * @param appName - App name.
 * @param nodes - node object. @example `nodes = {AELF: {rpcUrl:'xxx', chainId:"AELF"}, tDVV: {rpcUrl:'xxx', chainId:"tDVV"}}`
 */
export interface AElfReactProviderProps {
  children: ReactNode;
  appName: string;
  nodes?: {
    [key: string]: AelfNode;
  };
}
```

#### Example

```javascript
import { AElfReactProvider } from '@aelf-react/core';
function App() {
  return (
    <AElfReactProvider
      appName="example"
      nodes={{
        tDVV: { rpcUrl: 'https://tdvv-test-node.aelf.io', chainId: 'tDVV' },
      }}>
      <App />
    </AElfReactProvider>
  );
}
```

#### Multi node

In some cases, your dApp may want to maintain >1 active aelf node connections simultaneously.

```javascript
import { AElfReactProvider } from '@aelf-react/core';
function App() {
  return (
    <AElfReactProvider
      appName="example"
      nodes={{
        tDVV: { rpcUrl: 'https://tdvv-test-node.aelf.io', chainId: 'tDVV' },
        tDVW: { rpcUrl: 'https://tdvw-test-node.aelf.io', chainId: 'tDVW' },
      }}>
      <App />
    </AElfReactProvider>
  );
}
```

### useAElfReact

If you're using Hooks (😇), useAElfReact will be your best friend. Call it from within any function component to access context variables.

#### Example

```javascript
import { useAElfReact } from '@aelf-react/core';

function Component() {
  const aelfReact = useAElfReact();
  // ...
}
```

### Notice

aelf-bridge only supports one node and needs to check whether it is connected, NIGHT ELF supports multiple. If your application needs to use aelf-bridge you can usually do this.

```javascript
import { AElfDappBridge } from '@aelf-react/types';
let endpoint = '';

export function isAElfBridge(aelfBridge: AElfDappBridge) {
  return !!(aelfBridge.options && aelfBridge.connect);
}
export function isCurrentAElfBridge(aelfBridge: AElfDappBridge) {
  return endpoint === aelfBridge.options?.endpoint;
}

export async function reConnectAElfBridge(aelfBridge: AElfDappBridge) {
  const isConnected = await aelfBridge.connect?.();
  if (!isConnected) throw Error('Reconnects Fails');
  endpoint = aelfBridge.options?.endpoint || '';
}

export async function checkAElfBridge(aelfBridge: AElfDappBridge) {
  const isBridge = isAElfBridge(aelfBridge);
  const isCurrent = isCurrentAElfBridge(aelfBridge);
  if (isBridge && !isCurrent) {
    await reConnectAElfBridge(aelfBridge);
  }
}

async function request() {
  await checkAElfBridge(defaultAElfBridge);
  const req = await defaultAElfBridge.chain.getBlockHeight();
  // aelf-bridge returns the result directly NIGHT ELF will return the result in the result
  console.log(req.result || req);
}
```

### Example of use

head over to the [example/ folder](./example/).
