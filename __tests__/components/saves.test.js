/* eslint-env jest */
import mockPersistent from '../../__mocks__/persistent';
import mockState from '../../__mocks__/state';

import { emit } from '../../src/utils/emitter';
import { playMusic } from '../../src/components/sound';
import ink from '../../src/components/ink';
import { $getSlotName, load, save, existSave, removeSave, listSaves } from '../../src/components/saves';

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../src/components/ink', () => ({
  loadState: jest.fn(),
  getState: jest.fn(() => ({ inkjson: 'content' })),
  getVariable: jest.fn((v) => `${v}-value`)
}));

jest.mock('../../src/components/sound', () => ({
  playMusic: jest.fn()
}));

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
    persistent: mockPersistent
  }))
}));

jest
  .useFakeTimers()
  .setSystemTime(new Date('2023-08-09'));

beforeEach(() => {
  mockState.reset();
  mockPersistent.reset();
  jest.clearAllMocks();
  mockPersistent.init('myapp-test');
  mockState.setKey('game', { gameUUID: 'test-game' });
  mockState.setKey('scenes', []);
  mockState.setKey('vars', {});
});

describe('components/saves', () => {
  describe('$getSlotName', () => {
    test('getSlotName - default', () => {
      const slotName = $getSlotName();
      expect(slotName).toBe('test-game/_autosave_');
    });
    test('getSlotName - default', () => {
      const slotName = $getSlotName('save_id');
      expect(slotName).toBe('test-game/save_id');
    });
  });

  describe('save', () => {
    test('save game state', async () => {
      const mockScenes = ['scene1', 'scene2'];
      mockState.setKey('scenes', mockScenes);
      const saveID = 'save_id';
      await save(saveID);
      expect(ink.getState).toHaveBeenCalledTimes(1);
      const saved = await mockPersistent.get($getSlotName(saveID));
      expect(saved).toEqual({
        id: saveID,
        date: 1691539200000,
        game: mockState.get().game,
        scenes: mockScenes,
        state: { inkjson: 'content' }
      });
      expect(emit).toHaveBeenCalledWith('game/save', saveID);
    });
  });


  describe('load', () => {
    test('load game state', async () => {
      const mockScenes = ['scene1', 'scene2'];
      mockState.setKey('scenes', mockScenes);
      const saveID = 'save_id';
      await save(saveID);
      emit.mockClear();
      // load
      await load(saveID);
      expect(ink.loadState).toHaveBeenCalledWith({ inkjson: 'content' });
      expect(mockState.get().scenes).toEqual(mockScenes);
      expect(mockState.get().game).toEqual({ gameUUID: 'test-game' });
      expect(playMusic).not.toHaveBeenCalled();
      expect(mockState.get().vars).toEqual({});
      expect(emit).toHaveBeenCalledWith('game/load', saveID);
    });

    test('load game state - restore music', async () => {
      mockState.setSubkey('game', '$currentMusic', 'music.mp3');
      const saveID = 'save_id';
      expect(playMusic).not.toHaveBeenCalled();
      await save(saveID);
      emit.mockClear();
      // load
      await load(saveID);
      expect(playMusic).toHaveBeenCalledWith('music.mp3');
      expect(emit).toHaveBeenCalledWith('game/load', saveID);
    });

    test('load game state - restore music - false', async () => {
      mockState.setSubkey('game', '$currentMusic', false);
      const saveID = 'save_id';
      expect(playMusic).not.toHaveBeenCalled();
      await save(saveID);
      emit.mockClear();
      // load
      await load(saveID);
      expect(playMusic).not.toHaveBeenCalled();
      expect(emit).toHaveBeenCalledWith('game/load', saveID);
    });
  });

  describe('exist', () => {
    test('game state exists', async () => {
      const saveID = 'save_id';
      let saveExists = await existSave(saveID);
      expect(saveExists).toBe(false);
      await save(saveID);
      saveExists = await existSave(saveID);
      expect(saveExists).toBe(true);
      await removeSave(saveID);
      saveExists = await existSave(saveID);
      expect(saveExists).toBe(false);
    });
  });

  describe('listSaves', () => {
    test('get saves for specific game', async () => {
      mockState.setSubkey('game', 'gameUUID', 'UUID1');
      await save('game1_save1');
      await save('game1_save2');
      await save('game1_autosave');
      let savesList = await listSaves();
      expect(savesList).toEqual([{
        id: 'game1_save1',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: 'game1_save2',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: 'game1_autosave',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      // switch to another game
      mockState.setSubkey('game', 'gameUUID', 'UUID2');
      savesList = await listSaves();
      expect(savesList).toEqual([]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', []);
      // save something under new UUID
      await save('game2_checkpoint');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: 'game2_checkpoint',
        game: { gameUUID: 'UUID2' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
      // back to original game
      mockState.setSubkey('game', 'gameUUID', 'UUID1');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: 'game1_save1',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: 'game1_save2',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: 'game1_autosave',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
    });
  });
});
