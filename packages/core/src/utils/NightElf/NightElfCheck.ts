import { ErrorExtension } from './types';

let nightElfInstance: NightElfCheck = null;
let aelfInstanceByExtension = null;
export default class NightElfCheck {
  check: Promise<boolean | ErrorExtension>;
  constructor() {
    let resolveTemp = null;
    this.check = new Promise((resolve, reject) => {
      // @ts-ignore
      if (window.NightElf) {
        console.log('There is NIGHT ELF');
        resolve(true);
      }
      setTimeout(() => {
        reject({
          error: 200001,
          message: 'timeout, please download and install the NightELF explorer extension',
        });
      }, 5000);
      resolveTemp = resolve;
    });
    document.addEventListener('NightElf', () => {
      resolveTemp(true);
    });
  }
  static getInstance() {
    if (nightElfInstance) return nightElfInstance;
    nightElfInstance = new NightElfCheck();
    return nightElfInstance;
  }
  static initAelfInstanceByExtension(rpcUrl: string, appName: string) {
    // @ts-ignore
    aelfInstanceByExtension = new window.NightElf.AElf({
      httpProvider: [rpcUrl],
      appName,
    });
    return aelfInstanceByExtension;
  }
}
