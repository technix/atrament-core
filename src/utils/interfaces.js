import interfacePersistent from '../interfaces/persistent';
import interfaceSound from '../interfaces/sound';
import interfaceState from '../interfaces/state';

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
