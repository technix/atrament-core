/* eslint-env jest */
import { interfaces, defineInterfaces } from '../../src/utils/interfaces';

const defaultInterfaces = {
  loader: null,
  persistent: null,
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
  state: null
};

afterEach(() => defineInterfaces(defaultInterfaces));

describe('utils/interfaces', () => {
  test('define some interfaces', () => {
    let i = interfaces();
    expect(i).toEqual(defaultInterfaces);
    defineInterfaces({
      loader: 'loaderInterface',
      persistent: 'persistentInterface'
    });
    i = interfaces();
    expect(i).toEqual({
      loader: 'loaderInterface',
      persistent: 'persistentInterface',
      sound: defaultInterfaces.sound,
      state: null
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
      state: null
    });
  });
});
