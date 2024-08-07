/* eslint-env jest */
import mockPersistent from '../../__mocks__/persistent';
import mockState from '../../__mocks__/state';

import { emit } from '../../src/utils/emitter';
import ink from '../../src/components/ink';
import { getSaveSlotKey, load, save, existSave, removeSave, listSaves } from '../../src/components/saves';

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../src/components/ink', () => ({
  loadState: jest.fn(),
  getState: jest.fn(() => ({ inkjson: 'content' })),
  getVariable: jest.fn((v) => `${v}-value`)
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
  describe('getSaveSlotKey', () => {
    test('default', () => {
      const slotName = getSaveSlotKey({ type: 'autosave' });
      expect(slotName).toBe('test-game//save/autosave/');
    });
    test('default - named', () => {
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: 'stage1' });
      expect(slotName).toBe('test-game//save/checkpoint/stage1');
    });
    test('session', () => {
      mockState.setSubkey('game', '$sessionID', 's1');
      const slotName = getSaveSlotKey({ type: 'autosave' });
      expect(slotName).toBe('test-game/s1/save/autosave/');
    });
    test('session - named', () => {
      mockState.setSubkey('game', '$sessionID', 's1');
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: 'stage1' });
      expect(slotName).toBe('test-game/s1/save/checkpoint/stage1');
    });
  });

  describe('save', () => {
    test('save game state', async () => {
      const mockScenes = ['scene1', 'scene2'];
      mockState.setKey('scenes', mockScenes);
      const type = 'checkpoint';
      const name = 'stage2';
      // run
      await save({ type, name });
      // check
      expect(ink.getState).toHaveBeenCalledTimes(1);
      const saveID = getSaveSlotKey({ type, name });
      const saved = await mockPersistent.get(saveID);
      expect(saved).toEqual({
        name,
        type,
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
      const type = 'checkpoint';
      const name = 'stage2';
      // run
      await save({ type, name });
      emit.mockClear();
      // load
      const saveID = getSaveSlotKey({ type, name });
      await load(saveID);
      expect(ink.loadState).toHaveBeenCalledWith({ inkjson: 'content' });
      expect(mockState.get().scenes).toEqual(mockScenes);
      expect(mockState.get().game).toEqual({ gameUUID: 'test-game' });
      expect(mockState.get().vars).toEqual({});
      expect(emit).toHaveBeenCalledWith('game/load', saveID);
    });
  });

  describe('exist', () => {
    test('game state exists', async () => {
      const type = 'checkpoint';
      const name = 'stage2';
      const saveID = getSaveSlotKey({ type, name });
      // check
      let saveExists = await existSave(saveID);
      expect(saveExists).toBe(false);
      await save({ name, type });
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
      await save({ type: 'save', name: 'game1_save1' });
      await save({ type: 'checkpoint', name: 'game1_save2' });
      await save({ type: 'autosave' });
      let savesList = await listSaves();
      expect(savesList).toEqual([{
        name: 'game1_save1',
        type: 'save',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        name: 'game1_save2',
        type: 'checkpoint',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        type: 'autosave',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      // switch to another game
      mockState.setSubkey('game', 'gameUUID', 'UUID2');
      savesList = await listSaves();
      expect(savesList).toEqual([]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', []);
      // save something under new UUID
      await save({ type: 'checkpoint', name: 'game2_checkpoint' });
      savesList = await listSaves();
      expect(savesList).toEqual([{
        name: 'game2_checkpoint',
        type: 'checkpoint',
        game: { gameUUID: 'UUID2' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
      // back to original game
      mockState.setSubkey('game', 'gameUUID', 'UUID1');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        name: 'game1_save1',
        type: 'save',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        name: 'game1_save2',
        type: 'checkpoint',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        type: 'autosave',
        game: { gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
    });
  });
});
