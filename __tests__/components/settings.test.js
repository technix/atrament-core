/* eslint-env jest */
import mockPersistent from '../../__mocks__/persistent';
import mockState from '../../__mocks__/state';
import { emit } from '../../src/utils/emitter';

import settings from '../../src/components/settings';
import { setConfig } from '../../src/utils/config';

const mockSound = {
  mute: jest.fn(),
  setVolume: jest.fn()
};

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
    persistent: mockPersistent,
    sound: mockSound
  }))
}));

const defaultConfig = {
  applicationID: '!CHANGE_THIS',
  settings: {
    volume: 0,
    mute: true
  }
};


beforeEach(() => {
  mockState.reset();
  mockPersistent.reset();
  jest.clearAllMocks();
  setConfig(defaultConfig);
});


describe('components/settings', () => {
  describe('load', () => {
    test('default settings', async () => {
      await settings.load();
      expect(mockState.get().settings).toEqual({
        mute: true,
        volume: 0
      });
      expect(mockSound.mute).toHaveBeenCalledWith(true);
      expect(mockSound.setVolume).toHaveBeenCalledWith(0);
      expect(emit).toHaveBeenCalledWith('settings/load', {
        mute: true,
        volume: 0
      });
    });

    test('settings from config', async () => {
      setConfig(null, {
        applicationID: 'test-app',
        settings: {
          mute: false,
          volume: 5,
          fullscreen: false,
          fontsize: 10
        }
      });
      await settings.load();
      expect(mockState.get().settings).toEqual({
        mute: false,
        volume: 5,
        fullscreen: false,
        fontsize: 10
      });
      expect(mockSound.mute).toHaveBeenCalledWith(false);
      expect(mockSound.setVolume).toHaveBeenCalledWith(5);
    });

    test('settings from persistent', async () => {
      const savedSettings = {
        mute: false,
        volume: 10,
        fullscreen: true,
        fontsize: 20
      };
      await mockPersistent.set('settings', savedSettings);
      await settings.load();
      expect(mockState.get().settings).toEqual(savedSettings);
      expect(mockSound.mute).toHaveBeenCalledWith(false);
      expect(mockSound.setVolume).toHaveBeenCalledWith(10);
      expect(emit).toHaveBeenCalledWith('settings/load', savedSettings);
    });
  });

  describe('save', () => {
    test('save settings', async () => {
      const appSettings = {
        mute: false,
        volume: 5,
        fullscreen: false,
        fontsize: 15
      };
      mockState.setKey('settings', appSettings);
      await settings.save();
      const savedSettings = await mockPersistent.get('settings');
      expect(savedSettings).toEqual(appSettings);
      expect(emit).toHaveBeenCalledWith('settings/save', savedSettings);
    });
  });

  describe('get', () => {
    test('get setting', () => {
      const appSettings = {
        mute: false,
        volume: 5,
        fullscreen: false,
        fontsize: 15
      };
      mockState.setKey('settings', appSettings);
      const fontsize = settings.get('fontsize');
      expect(fontsize).toBe(appSettings.fontsize);
      const mute = settings.get('mute');
      expect(mute).toBe(appSettings.mute);
      expect(emit).toHaveBeenCalledWith('settings/get', { name: 'mute', value: appSettings.mute });
    });
  });

  describe('toggle', () => {
    test('toggle setting', () => {
      const appSettings = {
        mute: false,
        volume: 5,
        fullscreen: false,
        fontsize: 15
      };
      mockState.setKey('settings', appSettings);
      expect(settings.get('mute')).toBe(false);
      settings.toggle('mute');
      expect(settings.get('mute')).toBe(true);
      settings.toggle('mute');
      expect(settings.get('mute')).toBe(false);
    });
  });

  describe('set', () => {
    test('set value - mute (default handler)', () => {
      expect(mockSound.mute).not.toHaveBeenCalled();
      settings.set('mute', true);
      expect(emit).toHaveBeenCalledWith('settings/set', { name: 'mute', value: true });
      expect(mockSound.mute).toHaveBeenCalledWith(true);
      expect(settings.get('mute')).toBe(true);
      // toggle
      emit.mockClear();
      mockSound.mute.mockClear();
      settings.toggle('mute');
      expect(emit).toHaveBeenCalledWith('settings/set', { name: 'mute', value: false });
      expect(mockSound.mute).toHaveBeenCalledWith(false);
      expect(settings.get('mute')).toBe(false);
    });

    test('set value - setVolume (default handler)', () => {
      expect(mockSound.setVolume).not.toHaveBeenCalled();
      settings.set('volume', 50);
      expect(emit).toHaveBeenCalledWith('settings/set', { name: 'volume', value: 50 });
      expect(mockSound.setVolume).toHaveBeenCalledWith(50);
      expect(settings.get('volume')).toBe(50);
      // change
      emit.mockClear();
      mockSound.setVolume.mockClear();
      settings.set('volume', 90);
      expect(emit).toHaveBeenCalledWith('settings/set', { name: 'volume', value: 90 });
      expect(mockSound.setVolume).toHaveBeenCalledWith(90);
      expect(settings.get('volume')).toBe(90);
    });
  });

  describe('handlers', () => {
    test('custom handler', () => {
      const customHandler = jest.fn();
      settings.set('fontsize', 10);
      expect(customHandler).not.toHaveBeenCalled();
      settings.defineHandler('fontsize', customHandler);
      // set value
      settings.set('fontsize', 10);
      expect(customHandler).toHaveBeenCalledWith(10, 10); // old and new value
      expect(settings.get('fontsize')).toBe(10);
      // change
      customHandler.mockClear();
      settings.set('fontsize', 30);
      expect(customHandler).toHaveBeenCalledWith(10, 30); // old and new value
      expect(settings.get('fontsize')).toBe(30);
    });
  });
});
