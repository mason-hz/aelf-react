import type { AElfDappBridge } from '@aelf-react/types';
const toStr = (x: string, y: string) => '04' + x?.padStart(64, '0') + y?.padStart(64, '0');
const formatPubKey = (publicKey: any) => {
  try {
    const { x, y } = (typeof publicKey === 'object' ? publicKey : JSON.parse(publicKey)) || {};
    return toStr(x, y);
  } catch (e) {
    return publicKey;
  }
};

export const formatLoginInfo = (loginInfo: any) => {
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
