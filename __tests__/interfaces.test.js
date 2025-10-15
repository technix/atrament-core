/* eslint-env jest */
import { interfaces, defineInterfaces } from '../src/interfaces';

import stateInterface from '../src/interfaces/state';
import persistentInterface from '../src/interfaces/persistent';

const defaultInterfaces = {
  loader: null,
  persistent: persistentInterface,
  sound: {
    init: expect.any(Function),
    mute: expect.any(Function),
    isMuted: expect.any(Function),
    setVolume: expect.any(Function),
    getVolume: expect.any(Function),
    playSound: expect.any(Function),
    playMusic: expect.any(Function),
    stopMusic: expect.any(Function)
  },
  state: stateInterface
};

afterEach(() => defineInterfaces(defaultInterfaces));

describe('utils/interfaces', () => {
  test('define some interfaces', () => {
    let i = interfaces();
    expect(i).toEqual(defaultInterfaces);
    defineInterfaces({
      persistent: 'persistentInterface',
      state: 'stateInterface'
    });
    i = interfaces();
    expect(i).toEqual({
      loader: null,
      persistent: 'persistentInterface',
      sound: defaultInterfaces.sound,
      state: 'stateInterface'
    });
  });

  test('define unknown interfaces', () => {
    let i = interfaces();
    expect(i).toEqual(defaultInterfaces);
    defineInterfaces({
      unknown: 'unknownInterface',
      persistent: 'persistentInterface'
    });
    i = interfaces();
    expect(i).toEqual({
      loader: null,
      persistent: 'persistentInterface',
      sound: defaultInterfaces.sound,
      state: defaultInterfaces.state,
      unknown: 'unknownInterface'
    });
  });
});
