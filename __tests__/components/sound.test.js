/* eslint-env jest */
import { playSound, stopSound, playMusic, playSingleMusic, stopMusic } from '../../src/components/sound';
import mockState from '../../src/interfaces/state';

const mockPlaySound = jest.fn();
const mockStopSound = jest.fn();
const mockPlayMusic = jest.fn();
const mockStopMusic = jest.fn();

jest.mock('../../src/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
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
  mockState.reset();
  jest.clearAllMocks();
});


describe('components/sound', () => {
  test('playSound', () => {
    expect(mockPlaySound).toHaveBeenCalledTimes(0);
    playSound('sound/test.mp3');
    expect(mockPlaySound).toHaveBeenCalledTimes(1);
    expect(mockPlaySound).toHaveBeenCalledWith('/assets/sound/test.mp3');
  });

  test('playSound - multiple', () => {
    expect(mockPlaySound).toHaveBeenCalledTimes(0);
    playSound(['sound/file1.mp3', 'sound/file2.mp3']);
    expect(mockPlaySound).toHaveBeenCalledTimes(2);
    expect(mockPlaySound).toHaveBeenCalledWith('/assets/sound/file1.mp3');
    expect(mockPlaySound).toHaveBeenCalledWith('/assets/sound/file2.mp3');
  });

  test('stopSound - specific file', () => {
    expect(mockStopSound).toHaveBeenCalledTimes(0);
    stopSound('sound/test.mp3');
    expect(mockStopSound).toHaveBeenCalledTimes(1);
    expect(mockStopSound).toHaveBeenCalledWith('/assets/sound/test.mp3');
  });

  test('stopSound - multiple files', () => {
    expect(mockStopSound).toHaveBeenCalledTimes(0);
    stopSound(['sound/file1.mp3', 'sound/file2.mp3']);
    expect(mockStopSound).toHaveBeenCalledTimes(2);
    expect(mockStopSound).toHaveBeenCalledWith('/assets/sound/file1.mp3');
    expect(mockStopSound).toHaveBeenCalledWith('/assets/sound/file2.mp3');
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
    playMusic('sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockPlayMusic).toHaveBeenCalledTimes(1);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockState.get().game.$currentMusic).toEqual(['sound/test.mp3']);
    playMusic('sound/test2.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    expect(mockPlayMusic).toHaveBeenCalledTimes(2);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/sound/test2.mp3');
    expect(mockState.get().game.$currentMusic).toEqual(['sound/test.mp3', 'sound/test2.mp3']);
  });


  test('playSingleMusic', () => {
    mockState.setSubkey('game', '$currentMusic', ['sound/m1.mp3', 'sound/m2.mp3']);
    expect(mockPlayMusic).toHaveBeenCalledTimes(0);
    expect(mockStopMusic).toHaveBeenCalledTimes(0);

    playSingleMusic('sound/test.mp3');
    // stops all music, plays only the music provided
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockPlayMusic).toHaveBeenCalledTimes(1);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockState.get().game.$currentMusic).toEqual(['sound/test.mp3']);

    playSingleMusic(['sound/test2.mp3', 'sound/test3.mp3']);
    // stops all music, plays only the last music provided
    expect(mockStopMusic).toHaveBeenCalledTimes(2);
    expect(mockPlayMusic).toHaveBeenCalledTimes(2);
    expect(mockPlayMusic).toHaveBeenCalledWith('/assets/sound/test3.mp3');
    expect(mockState.get().game.$currentMusic).toEqual(['sound/test3.mp3']);
  });


  test('stopMusic - specific file', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    playMusic(['sound/test.mp3', 'sound/test2.mp3']);
    stopMusic('sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockState.get().game.$currentMusic).toEqual(['sound/test2.mp3']);
    stopMusic('sound/test2.mp3');
    expect(mockStopMusic).toHaveBeenCalledTimes(2);
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test2.mp3');
    expect(mockState.get().game.$currentMusic).toEqual([]);
  });

  test('stopMusic - multiple files', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    playMusic(['sound/test.mp3', 'sound/test2.mp3']);
    stopMusic(['sound/test.mp3', 'sound/test2.mp3']);
    expect(mockStopMusic).toHaveBeenCalledTimes(2);
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test2.mp3');
    expect(mockState.get().game.$currentMusic).toEqual([]);
  });

  test('stopMusic without current music', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    stopMusic(['sound/test.mp3', 'sound/test2.mp3']);
    expect(mockStopMusic).toHaveBeenCalledTimes(2);
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test.mp3');
    expect(mockStopMusic).toHaveBeenCalledWith('/assets/sound/test2.mp3');
    expect(mockState.get().game.$currentMusic).toEqual([]);
  });

  test('stopMusic - all music', () => {
    expect(mockStopMusic).toHaveBeenCalledTimes(0);
    playMusic(['sound/test.mp3', 'sound/test2.mp3']);
    stopMusic();
    expect(mockStopMusic).toHaveBeenCalledTimes(1);
    expect(mockStopMusic).toHaveBeenCalledWith();
    expect(mockState.get().game.$currentMusic).toEqual([]);
  });
});
