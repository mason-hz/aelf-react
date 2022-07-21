import { AElfAddress, AElfDappBridge, PublicKey } from '@aelf-react/types';
import type { ReactNode, Dispatch } from 'react';

export enum Actions {
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}

export type AelfNode = {
  rpcUrl: string;
  chainId: string;
};

/**
 * @param children - A React subtree that needs access to the context.
 * @param appName - App name.
 * @param nodes - node object. @example `nodes = {AELF: {rpcUrl:'xxx', chainId:"AELF"}, tDVV: {rpcUrl:'xxx', chainId:"tDVV"}}`.
 * @see https://github.com/mason-hz/aelf-react/blob/dev/example/src/index.tsx#:~:text=%3CAElfReactProvider,/AElfReactProvider%3E
 */
export interface AElfReactProviderProps {
  children: ReactNode;
  appName: string;
  nodes?: {
    [key: string]: AelfNode;
  };
}

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
  activate: (nodes?: AElfReactProviderProps['nodes']) => Promise<true>;
  // deactivate connection
  deactivate: () => Promise<true>;
  // try eagerly connection
  connectEagerly: (nodes?: AElfReactProviderProps['nodes']) => Promise<true>;
}

export type ReducerAction = {
  type: Actions;
  payload?: any;
};

export type NightELFListener = {
  type: string;
  detail?: {
    address?: string;
  };
};

export interface AElfContextDefine {
  state: AElfContextState;
  dispatch: Dispatch<ReducerAction>;
}
