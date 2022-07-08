const storages = {
  connectEagerly: 'aelf-connect-eagerly',
};

export function getItem(key: string) {
  return localStorage.getItem(key);
}

export function setItem(key: string, value: string) {
  return localStorage.setItem(key, value);
}

export function getConnectEagerlyItem() {
  return JSON.parse(getItem(storages.connectEagerly));
}
export function setConnectEagerlyItem(value: boolean) {
  return setItem(storages.connectEagerly, JSON.stringify(value));
}
