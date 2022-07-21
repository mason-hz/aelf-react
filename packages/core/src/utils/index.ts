import type { AElfDappBridge, PublicKey } from '@aelf-react/types';
import { AElfReactProviderProps } from '../types';
import { isMobileDevices } from './isMobile';
const toStr = (x: string, y: string) => '04' + x?.padStart(64, '0') + y?.padStart(64, '0');
const formatPubKey = (publicKey: PublicKey | string) => {
  try {
    const { x, y } = (typeof publicKey === 'object' ? publicKey : JSON.parse(publicKey)) || {};
    return toStr(x, y);
  } catch (e) {
    return publicKey;
  }
};

export const formatLoginInfo = (loginInfo: string) => {
  const detail = JSON.parse(loginInfo);
  const account = detail.address;
  const pubKey = formatPubKey(detail.publicKey);
  delete detail.address;
  return { ...detail, account, pubKey };
};

export const getSignatureByBridge = async (aelfBridge: AElfDappBridge, account: string, hexToBeSign: string) => {
  if (aelfBridge.connected !== undefined) {
    const sign = await aelfBridge.sendMessage('keyPairUtils', { method: 'sign', arguments: [hexToBeSign] });
    if (sign?.error) throw sign;
    return [sign.r.toString(16, 64), sign.s.toString(16, 64), `0${sign.recoveryParam.toString()}`].join('');
  } else {
    const sign = await aelfBridge.getSignature({ address: account, hexToBeSign });
    if (sign?.error) throw sign;
    return sign?.signature;
  }
};

export const getBridges = async (nodes: AElfReactProviderProps['nodes'], appName: string) => {
  // @ts-ignore
  const isAElfBridge = isMobileDevices() && !window?.NightElf;
  const connector = (await (isAElfBridge ? import('./NightElf/AelfBridgeCheck') : import('./NightElf/NightElfCheck')))
    .default;
  // check connector
  await connector.getInstance().check();

  let firstKey = '';
  const bridges: { [key: string]: AElfDappBridge } = {};
  Object.entries(nodes).forEach(([k, v]) => {
    if (!firstKey) firstKey = k;
    bridges[k] = connector.initAelfInstanceByExtension(v.rpcUrl, appName);
  });
  const node = nodes[firstKey];
  const bridge = bridges[firstKey];
  return { bridge, node, bridges };
};
