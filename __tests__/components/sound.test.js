/* eslint-env jest */
import { playSound, stopSound, playMusic, stopMusic } from '../../src/components/sound';

const mockPlaySound = jest.fn();
const mockStopSound = jest.fn();
const mockPlayMusic = jest.fn();
const mockStopMusic = jest.fn();
const mockSetSubkey = jest.fn();

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: {
      setSubkey: mockSetSubkey
    },
    sound: {
      playSound: mockPlaySound,
      stopSound: mockStopSound,
      playMusic: mockPlayMusic,
      stopMusic: mockStopMusic
    },
    loader: {
      getAssetPath: (file) => `/assets/${file}`
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

  test('stopSound - specific file', () => {
    expect(mockStopSound).toHaveBeenCalledTimes(0);
    stopSound('sound/test.mp3');
    expect(mockStopSound).toHaveBeenCalledTimes(1);
    expect(mockStopSound).toHaveBeenCalledWith('/assets/sound/test.mp3');
  });

  test('stopSound - all sounds', () => {
    expect(mockStopSound).toHaveBeenCalledTimes(0);
    stopSound();
    expect(mockStopSound).toHaveBeenCalledTimes(1);
    expect(mockStopSound).toHaveBeenCalledWith(null);
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

  test('stopMusic - specific file', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockSetSubkey).toHaveBeenCalledTimes(0);
    stopMusic('sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockSetSubkey).toHaveBeenCalledTimes(1);
    expect(mockSetSubkey).toHaveBeenCalledWith('game', '$currentMusic', false);
  });

  test('stopMusic - all music', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockSetSubkey).toHaveBeenCalledTimes(0);
    stopMusic();
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith(null);
    expect(mockSetSubkey).toHaveBeenCalledTimes(1);
    expect(mockSetSubkey).toHaveBeenCalledWith('game', '$currentMusic', false);
  });
});
