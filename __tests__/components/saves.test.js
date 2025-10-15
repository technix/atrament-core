/* eslint-env jest */
import mockPersistent from '../../src/interfaces/persistent';
import mockState from '../../src/interfaces/state';

import { emit } from '../../src/utils/emitter';
import { setSession } from '../../src/components/game/sessions';
import ink from '../../src/components/ink';
import {
  getSaveSlotKey,
  getState,
  setState,
  load,
  save,
  existSave,
  removeSave,
  listSaves,
  SAVE_GAME,
  SAVE_AUTOSAVE,
  SAVE_CHECKPOINT
} from '../../src/components/saves';

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
  mockState.setKey('game', { $gameUUID: 'test-game' });
  mockState.setKey('scenes', []);
  mockState.setKey('vars', {});
});

describe('components/saves', () => {
  describe('getSaveSlotKey', () => {
    test('default', () => {
      const slotName = getSaveSlotKey({ type: 'autosave' });
      expect(slotName).toBe(`test-game//save/${SAVE_AUTOSAVE}/`);
    });
    test('default - named', () => {
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: 'stage1' });
      expect(slotName).toBe(`test-game//save/${SAVE_CHECKPOINT}/stage1`);
    });
    test('default - numbered', () => {
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: 1 });
      expect(slotName).toBe(`test-game//save/${SAVE_CHECKPOINT}/1`);
    });
    test('default - untyped', () => {
      const slotName = getSaveSlotKey({ type: true, name: 'check' });
      expect(slotName).toBe(`test-game//save/${SAVE_GAME}/check`);
    });
    test('default - unnamed', () => {
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: true });
      expect(slotName).toBe(`test-game//save/${SAVE_CHECKPOINT}/`);
    });
    test('session', () => {
      mockState.setSubkey('game', '$sessionID', 's1');
      const slotName = getSaveSlotKey({ type: 'autosave' });
      expect(slotName).toBe(`test-game/s1/save/${SAVE_AUTOSAVE}/`);
    });
    test('session - named', () => {
      mockState.setSubkey('game', '$sessionID', 's1');
      const slotName = getSaveSlotKey({ type: 'checkpoint', name: 'stage1' });
      expect(slotName).toBe(`test-game/s1/save/${SAVE_CHECKPOINT}/stage1`);
    });
  });

  describe('getState/setState', () => {
    test('get game state', async () => {
      const mockScenes = ['scene1', 'scene2'];
      mockState.setKey('scenes', mockScenes);
      // run
      const gameState = getState();
      // check
      expect(ink.getState).toHaveBeenCalledTimes(1);
      expect(gameState).toEqual({
        date: 1691539200000,
        game: mockState.get().game,
        scenes: mockScenes,
        state: { inkjson: 'content' }
      });
    });

    test('set game state', async () => {
      const gameState = {
        date: 1791539200000,
        game: { name: 'test-game', title: '111' },
        scenes: ['sceneA', 'sceneB'],
        state: { inkjson: 'content' }
      };
      // run
      setState(gameState);
      // check
      expect(ink.loadState).toHaveBeenCalledWith(gameState.state);
      expect(mockState.get().scenes).toEqual(gameState.scenes);
      expect(mockState.get().game).toEqual(gameState.game);
      expect(mockState.get().vars).toEqual({});
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
      expect(mockState.get().game).toEqual({ $gameUUID: 'test-game' });
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
      mockState.setSubkey('game', '$gameUUID', 'UUID1');
      await save({ type: 'game', name: 'game1_save1' });
      await save({ type: 'checkpoint', name: 'game1_save2' });
      await save({ type: 'autosave' });
      let savesList = await listSaves();
      expect(savesList).toEqual([{
        id: getSaveSlotKey({ type: 'game', name: 'game1_save1' }),
        name: 'game1_save1',
        type: 'game',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'checkpoint', name: 'game1_save2' }),
        name: 'game1_save2',
        type: 'checkpoint',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'autosave' }),
        type: 'autosave',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      // switch to another game
      mockState.setSubkey('game', '$gameUUID', 'UUID2');
      savesList = await listSaves();
      expect(savesList).toEqual([]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', []);
      // save something under new UUID
      await save({ type: 'checkpoint', name: 'game2_checkpoint' });
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: getSaveSlotKey({ type: 'checkpoint', name: 'game2_checkpoint' }),
        name: 'game2_checkpoint',
        type: 'checkpoint',
        game: { $gameUUID: 'UUID2' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
      // back to original game
      mockState.setSubkey('game', '$gameUUID', 'UUID1');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: getSaveSlotKey({ type: 'game', name: 'game1_save1' }),
        name: 'game1_save1',
        type: 'game',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'checkpoint', name: 'game1_save2' }),
        name: 'game1_save2',
        type: 'checkpoint',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'autosave' }),
        type: 'autosave',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      expect(emit).toHaveBeenCalledWith('game/listSaves', savesList);
    });

    test('list saves for specific session', async () => {
      mockState.setSubkey('game', '$gameUUID', 'UUID1');
      await save({ type: 'game', name: 'game1_save1' });
      await save({ type: 'checkpoint', name: 'game1_save2' });
      setSession('session1');
      await save({ type: 'game', name: 'game1_session1_save1' });
      await save({ type: 'checkpoint', name: 'game1_session1_save2' });
      setSession('session2');
      await save({ type: 'game', name: 'game1_session2_save1' });
      await save({ type: 'checkpoint', name: 'game1_session2_save2' });
      let savesList;
      // check saves for default session
      setSession('');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: getSaveSlotKey({ type: 'game', name: 'game1_save1' }),
        name: 'game1_save1',
        type: 'game',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'checkpoint', name: 'game1_save2' }),
        name: 'game1_save2',
        type: 'checkpoint',
        game: { $gameUUID: 'UUID1' },
        date: 1691539200000
      }]);
      // check saves for session1
      setSession('session1');
      savesList = await listSaves();
      expect(savesList).toEqual([{
        id: getSaveSlotKey({ type: 'game', name: 'game1_session1_save1' }),
        name: 'game1_session1_save1',
        type: 'game',
        game: { $gameUUID: 'UUID1', $sessionID: 'session1' },
        date: 1691539200000
      }, {
        id: getSaveSlotKey({ type: 'checkpoint', name: 'game1_session1_save2' }),
        name: 'game1_session1_save2',
        type: 'checkpoint',
        game: { $gameUUID: 'UUID1', $sessionID: 'session1' },
        date: 1691539200000
      }]);
    });
  });
});
