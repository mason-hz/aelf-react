import AElfBridge from 'aelf-bridge';
import { ErrorExtension } from './types';

let aelfBridgeInstance: AelfBridgeCheck = null;
let aelfInstanceByBridge = null;

let accountInfo = null;
export default class AelfBridgeCheck {
  public check?: () => Promise<boolean | ErrorExtension>;
  constructor() {
    this.check = async () => {
      return new Promise((resolve, reject) => {
        const bridgeInstance = new AElfBridge({
          timeout: 3000,
        });
        bridgeInstance.connect().then((isConnected) => {
          if (isConnected) {
            resolve(true);
          } else {
            reject({
              error: 200001,
              message: 'timeout, please use AELF Wallet APP or open the page in PC',
            });
          }
        });
        setTimeout(() => {
          reject({
            error: 200001,
            message: 'timeout, please use AELF Wallet APP or open the page in PC',
          });
        }, 3000);
      });
    };
  }
  static getInstance() {
    if (aelfBridgeInstance) return aelfBridgeInstance;
    aelfBridgeInstance = new AelfBridgeCheck();
    return aelfBridgeInstance;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static initAelfInstanceByExtension(rpcUrl: string, appName: string) {
    aelfInstanceByBridge = new AElfBridge({
      endpoint: rpcUrl,
    });

    aelfInstanceByBridge.login = async () => {
      if (accountInfo) {
        return accountInfo;
      }
      const account = await aelfInstanceByBridge.account();
      accountInfo = {
        detail: JSON.stringify(account.accounts[0]),
      };
      return accountInfo;
    };
    aelfInstanceByBridge.logout = (param, callback) => {
      accountInfo = null;
      callback();
    };
    return aelfInstanceByBridge;
  }
}
