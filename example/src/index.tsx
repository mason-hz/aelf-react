import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AElfReactProvider, getSignatureByBridge, useAElfReact } from '@aelf-react/core';
import AElf from 'aelf-sdk';
import './index.css';
import { checkAElfBridge } from './utils';

function App() {
  // defaultAElfBridge is the first node, which is tDVV
  const { account, activate, deactivate, pubKey, defaultAElfBridge, aelfBridges } = useAElfReact();
  const [blockHeight, setBlockHeight] = useState<any>();
  const [contract, setContract] = useState<any>();
  const [tokenInfo, setTokenInfo] = useState<any>();
  const [signature, setSignature] = useState<any>();
  const changeWallet = useCallback(async () => {
    await deactivate();
    activate();
  }, [activate, deactivate]);
  const childrenList = () => {
    const list = [];
    account && list.push(`account:${account}`);
    pubKey && list.push(`pubKey:${pubKey}`);
    blockHeight && list.push(`blockHeight:${JSON.stringify(blockHeight)}`);
    contract && list.push(`contract methods:${JSON.stringify(Object.keys(contract))}`);
    tokenInfo && list.push(`ELF tokenInfo:${JSON.stringify(tokenInfo)}`);
    signature && list.push(`signature example:${signature}`);
    return list;
  };
  return (
    <>
      {childrenList().map((i, k) => (
        <p key={k}>{i}</p>
      ))}
      <button onClick={() => activate()}>activate</button>
      <button onClick={() => deactivate()}>deactivate</button>
      <button onClick={() => changeWallet()}>changeWallet</button>
      <button
        onClick={async () => {
          if (!aelfBridges) return;
          try {
            // aelf-bridge only supports one node and needs to check whether it is connected
            // NightElf does not require this function
            await checkAElfBridge(aelfBridges.tDVV);
            const tDVVReq = await aelfBridges.tDVV.chain.getBlockHeight();
            await checkAElfBridge(aelfBridges.tDVW);
            const tDVWReq = await aelfBridges.tDVW.chain.getBlockHeight();
            // aelf-bridge returns the result directly NightElf will return the result in the result
            setBlockHeight({
              tDVVBlockHeight: tDVVReq.result || tDVVReq,
              tDVWBlockHeight: tDVWReq.result || tDVWReq,
            });
          } catch (error) {
            setBlockHeight(`${error}`);
          }
        }}>
        getBlockHeight
      </button>
      <button
        onClick={async () => {
          if (!defaultAElfBridge || !account) return;
          const req = await defaultAElfBridge.chain.contractAt('JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE', {
            address: account,
          });
          setContract(req.result || req);
        }}>
        contractAt Token contract
      </button>
      <button
        onClick={async () => {
          if (!contract) return;
          const req = await contract.GetTokenInfo.call({ symbol: 'ELF' });
          setTokenInfo(req.result || req);
        }}>
        GetTokenInfo
      </button>
      <button
        onClick={async () => {
          if (!defaultAElfBridge || !account) return;
          const signature = await getSignatureByBridge(defaultAElfBridge, account, AElf.utils.sha256('example'));
          setSignature(signature);
        }}>
        Signature
      </button>
    </>
  );
}
const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AElfReactProvider
      appName="example"
      nodes={{
        tDVV: { rpcUrl: 'https://tdvv-test-node.aelf.io', chainId: 'tDVV' },
        tDVW: { rpcUrl: 'https://tdvw-test-node.aelf.io', chainId: 'tDVW' },
      }}>
      <App />
    </AElfReactProvider>
  </React.StrictMode>,
);
