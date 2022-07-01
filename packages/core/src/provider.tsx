import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { AElfAddress, AElfDappBridge, PublicKey } from '@aelf-react/types';
import { isMobileDevices } from './utils/isMobile';
import { formatLoginInfo } from './utils';

const ACTIVATE = 'activate';
const DEACTIVATE = 'deactivate';

const Listeners = ['nightElfRemoveKeyPairs', 'nightElfLockWallet'];

/**
 * @param children - A React subtree that needs access to the context.
 * @param appName - App name.
 * @param nodes - node object. @example `nodes = {AELF: {rpcUrl:'xxx', chainId:"AELF"}, tDVV: {rpcUrl:'xxx', chainId:"tDVV"}}`
 */
export interface AElfReactProviderProps {
  children: ReactNode;
  appName: string;
  nodes?: {
    [key: string]: {
      rpcUrl: string;
      chainId: string;
    };
  };
}

export interface AElfContextType {
  name?: string;
  chainId?: string;
  account?: AElfAddress;
  defaultAElfBridge?: AElfDappBridge;
  aelfBridges?: { [key: string]: AElfDappBridge };
  isActive: boolean;
  pubKey?: string;
  publicKey?: PublicKey;
  activate: (nodes?: AElfReactProviderProps['nodes']) => Promise<true | any>;
  deactivate: () => Promise<true | any>;
  nodes?: AElfReactProviderProps['nodes'];
}

const INITIAL_STATE = {
  isActive: false,
  account: undefined,
  defaultAElfBridge: undefined,
  aelfBridges: undefined,
  pubKey: undefined,
  publicKey: undefined,
};

const AElfContext = createContext<any>(undefined);

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case DEACTIVATE: {
      return Object.assign({}, state, INITIAL_STATE, payload);
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function AElfReactProvider({ children, appName, nodes: providerNodes }: AElfReactProviderProps) {
  const [state, dispatch]: [AElfContextType, any] = useReducer(reducer, INITIAL_STATE);
  const activate = useCallback(
    async (activateNodes?: AElfReactProviderProps['nodes']) => {
      const nodes = activateNodes || providerNodes;
      if (!nodes) throw Error('activate must exist nodes');
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        // @ts-ignore
        const isAElfBridge = isMobileDevices() && !window?.NightElf;
        const connector = (
          await (isAElfBridge ? import('./utils/NightElf/AelfBridgeCheck') : import('./utils/NightElf/NightElfCheck'))
        ).default;
        connector
          .getInstance()
          .check.then(() => {
            let firstKey = '';
            const bridges: { [key: string]: AElfDappBridge } = {};
            Object.entries(nodes).forEach(([k, v]) => {
              if (!firstKey) firstKey = k;
              bridges[k] = connector.initAelfInstanceByExtension(v.rpcUrl, appName);
            });
            const node = nodes[firstKey];
            const bridge = bridges[firstKey];
            bridge
              .login({
                chainId: node.chainId,
                payload: {
                  method: 'LOGIN',
                },
              })
              .then(async (result) => {
                if (result.error) {
                  reject(result);
                } else {
                  if (isMobileDevices()) {
                    await bridge.connect();
                  } else {
                    await Promise.all(Object.values(bridges).map((i) => i.chain.getChainStatus()));
                  }
                  const detail = formatLoginInfo(result.detail);
                  dispatch({
                    type: ACTIVATE,
                    payload: { ...detail, defaultAElfBridge: bridge, aelfBridges: bridges, isActive: true, nodes },
                  });
                  resolve(true);
                }
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    [appName, providerNodes],
  );
  const deactivate = useCallback(async () => {
    if (!state.account || !state.defaultAElfBridge) return;
    return new Promise((resolve, reject) => {
      state.defaultAElfBridge?.logout(
        {
          address: state.account,
        },
        (error: any) => {
          if (error) {
            reject(error);
          } else {
            dispatch({ type: DEACTIVATE });
            resolve(true);
          }
        },
      );
    });
  }, [state.account, state.defaultAElfBridge]);
  const listener = useCallback(
    (v) => {
      try {
        if ((v.type === Listeners[0] && v.detail?.address === state.account) || v.type === Listeners[1])
          dispatch({ type: DEACTIVATE });
      } catch (error) {
        console.debug(error);
      }
    },
    [state.account],
  );
  useEffect(() => {
    Listeners.forEach((key) => {
      document.addEventListener(key, listener);
    });
    return () => {
      Listeners.forEach((key) => {
        document.removeEventListener(key, listener);
      });
    };
  }, [listener]);
  return useMemo(
    () => <AElfContext.Provider value={{ ...state, activate, deactivate }}>{children}</AElfContext.Provider>,
    [state, activate, deactivate, children],
  );
}

export function useAElfReact(): AElfContextType {
  const context = useContext(AElfContext);
  if (!context) throw Error('useAElfReact can only be used within the AElfReactProvider component');
  return context;
}
