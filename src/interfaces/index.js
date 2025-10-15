import interfacePersistent from './persistent';
import interfaceSound from './sound';
import interfaceState from './state';

let $interfaces = {
  loader: null,
  persistent: interfacePersistent,
  sound: interfaceSound,
  state: interfaceState
};

export const interfaces = () => $interfaces;

export function defineInterfaces(interfaceDefinitions) {
  $interfaces = { ...$interfaces, ...interfaceDefinitions };
}
