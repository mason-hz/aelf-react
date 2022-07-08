import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { isMobileDevices } from './utils/isMobile';
import { formatLoginInfo, getBridges } from './utils';
import {
  Actions,
  AElfContextState,
  AElfContextType,
  AElfReactProviderProps,
  NightELFListener,
  ReducerAction,
} from './types';
import { getConnectEagerlyItem, setConnectEagerlyItem } from './utils/storage';
const Listeners = ['nightElfRemoveKeyPairs', 'nightElfLockWallet'];
const INITIAL_STATE = {
  isActive: false,
  account: undefined,
  defaultAElfBridge: undefined,
  aelfBridges: undefined,
  pubKey: undefined,
  publicKey: undefined,
};

const AElfContext = createContext<AElfContextType | undefined>(undefined);

//reducer
function reducer(state: AElfContextState, { type, payload }: ReducerAction) {
  switch (type) {
    case Actions.DEACTIVATE: {
      setConnectEagerlyItem(false);
      return Object.assign({}, state, INITIAL_STATE, payload);
    }
    case Actions.ACTIVATE: {
      setConnectEagerlyItem(true);
      return Object.assign({}, state, payload);
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function AElfReactProvider({ children, appName, nodes: providerNodes }: AElfReactProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { account, defaultAElfBridge } = state;
  const activate = useCallback(
    async (activateNodes?: AElfReactProviderProps['nodes']) => {
      const nodes = activateNodes || providerNodes;
      if (!nodes) throw Error('activate must exist nodes');
      const { bridge, bridges, node } = await getBridges(nodes, appName);
      const result = await bridge.login({ chainId: node.chainId, payload: { method: 'LOGIN' } });
      // login fail
      if (result.error) throw result.errorMessage || result;

      // is aelf-bridge by wallet app
      if (isMobileDevices()) {
        await bridge.connect();
        // is NightElf
      } else {
        await Promise.all(Object.values(bridges).map((i) => i.chain.getChainStatus()));
      }

      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          ...formatLoginInfo(result.detail),
          defaultAElfBridge: bridge,
          aelfBridges: bridges,
          isActive: true,
          nodes,
        },
      });
      return true;
    },
    [appName, providerNodes],
  );
  const deactivate = useCallback(async () => {
    if (!account || !defaultAElfBridge) throw Error('no active connection');
    const result = await defaultAElfBridge?.logout({ address: account });
    if (result.error) throw result;
    dispatch({ type: Actions.DEACTIVATE });
    return true;
  }, [account, defaultAElfBridge]);
  const connectEagerly = useCallback(
    async (activateNodes?: AElfReactProviderProps['nodes']) => {
      const isConnectEagerly = getConnectEagerlyItem();
      if (isConnectEagerly) return await activate(activateNodes);
      throw Error('Can‘t Connect Eagerly');
    },
    [activate],
  );
  const listener = useCallback(
    (result: NightELFListener) => {
      try {
        const { type, detail } = result;
        if ((type === Listeners[0] && detail.address === account) || type === Listeners[1])
          dispatch({ type: Actions.DEACTIVATE });
      } catch (error) {
        console.debug(error);
      }
    },
    [account],
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
    () => (
      <AElfContext.Provider value={{ ...state, activate, deactivate, connectEagerly }}>{children}</AElfContext.Provider>
    ),
    [state, activate, deactivate, connectEagerly, children],
  );
}

export function useAElfReact() {
  const context = useContext(AElfContext);
  if (!context) throw Error('useAElfReact can only be used within the AElfReactProvider component');
  return context;
}
