let $interfaces = {
  loader: null,
  persistent: null,
  sound: {
    init: () => {},
    mute: () => {},
    isMuted: () => {},
    setVolume: () => {},
    getVolume: () => {},
    playSound: () => {},
    playMusic: () => {},
    stopMusic: () => {}
  },
  state: null
};

export const interfaces = () => $interfaces;

export function defineInterfaces(interfaceDefinitions) {
  $interfaces = { ...$interfaces, ...interfaceDefinitions };
}
