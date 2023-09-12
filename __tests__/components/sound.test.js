/* eslint-env jest */
import { playMusic, playSound } from '../../src/components/sound';

const mockPlaySound = jest.fn();
const mockPlayMusic = jest.fn();
const mockStopMusic = jest.fn();
const mockSetSubkey = jest.fn();

jest.mock('../../src/components/assetpath', () => jest.fn((file) => `/assets/${file}`));

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: {
      setSubkey: mockSetSubkey
    },
    sound: {
      playSound: mockPlaySound,
      playMusic: mockPlayMusic,
      stopMusic: mockStopMusic
    }
  }))
}));

beforeEach(() => {
  jest.clearAllMocks();
});


describe('components/sound', () => {
  test('playSound', () => {
    expect(mockPlaySound).toHaveBeenCalledTimes(0);
    playSound('sound/test.mp3');
    expect(mockPlaySound).toHaveBeenCalledTimes(1);
    expect(mockPlaySound).toHaveBeenCalledWith('/assets/sound/test.mp3');
  });

  test('playMusic', () => {
    expect(mockPlayMusic).toHaveBeenCalledTimes(0);
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockSetSubkey).toHaveBeenCalledTimes(0);
    playMusic('sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith();
    expect(mockPlayMusic).toHaveBeenCalledTimes(1);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockSetSubkey).toHaveBeenCalledTimes(1);
    expect(mockSetSubkey).toHaveBeenCalledWith('game', '$currentMusic', 'sound/test.mp3');
  });

  test('playMusic - just stop', () => {
    expect(mockPlayMusic).toHaveBeenCalledTimes(0);
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockSetSubkey).toHaveBeenCalledTimes(0);
    playMusic(false);
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith();
    expect(mockPlayMusic).not.toHaveBeenCalled();
    expect(mockSetSubkey).toHaveBeenCalledTimes(1);
    expect(mockSetSubkey).toHaveBeenCalledWith('game', '$currentMusic', false);
  });
});
