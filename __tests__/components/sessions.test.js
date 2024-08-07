/* eslint-env jest */
import mockPersistent from '../../__mocks__/persistent';
import mockState from '../../__mocks__/state';

import { getSession, setSession, getSessions, removeSession } from '../../src/components/sessions';

import { emit } from '../../src/utils/emitter';

import {
  save,
  SAVE_GAME
} from '../../src/components/saves';

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../src/components/ink', () => ({
  getState: jest.fn(() => ({ inkjson: 'content' }))
}));

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
    persistent: mockPersistent
  }))
}));

beforeEach(() => {
  mockState.reset();
  mockPersistent.reset();
  jest.clearAllMocks();
  mockPersistent.init('myapp-test');
  mockState.setKey('game', { $gameUUID: 'test-game' });
  mockState.setKey('scenes', []);
  mockState.setKey('vars', {});
});



describe('components/sessions', () => {
  test('get/set session', () => {
    // default
    let session;
    session = getSession();
    expect(session).toBe('');
    // set
    setSession('session');
    session = getSession();
    expect(session).toBe('session');
    expect(emit).toHaveBeenCalledWith('game/setSession', 'session');
    emit.mockClear();
    // set number
    setSession(0);
    session = getSession();
    expect(session).toBe(0);
    expect(emit).toHaveBeenCalledWith('game/setSession', 0);
    emit.mockClear();
    // reset
    setSession(null);
    session = getSession();
    expect(session).toBe('');
    expect(emit).toHaveBeenCalledWith('game/setSession', '');
  });

  describe('getSessions', () => {
    test('empty', async () => {
      // run
      const sessions = await getSessions();
      // check
      expect(sessions).toEqual({});
      expect(emit).toHaveBeenCalledWith('game/getSessions', {});
    });

    test('single default session', async () => {
      // prepare
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      const expectedSessions = { '': 2 };
      // run
      const sessions = await getSessions();
      // check
      expect(sessions).toEqual(expectedSessions);
      expect(emit).toHaveBeenCalledWith('game/getSessions', expectedSessions);
    });

    test('multiple sessions', async () => {
      // prepare
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      setSession('session1');
      save({ type: SAVE_GAME, name: 'save1' });
      setSession('session2');
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      save({ type: SAVE_GAME, name: 'save3' });
      const expectedSessions = {
        '': 2,
        session1: 1,
        session2: 3
      };
      // run
      const sessions = await getSessions();
      // check
      expect(sessions).toEqual(expectedSessions);
      expect(emit).toHaveBeenCalledWith('game/getSessions', expectedSessions);
    });
  });

  describe('deleteSession', () => {
    test('empty', async () => {
      // run
      await removeSession();
      // check
      const sessions = await getSessions();
      expect(sessions).toEqual({});
      expect(emit).toHaveBeenCalledWith('game/deleteSession', '');
    });

    test('single default session', async () => {
      // prepare
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      const expectedSessions = {};
      // run
      await removeSession();
      // check
      const sessions = await getSessions();
      expect(sessions).toEqual(expectedSessions);
      expect(emit).toHaveBeenCalledWith('game/deleteSession', '');
    });

    test('multiple sessions', async () => {
      // prepare
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      setSession('session1');
      save({ type: SAVE_GAME, name: 'save1' });
      setSession('session2');
      save({ type: SAVE_GAME, name: 'save1' });
      save({ type: SAVE_GAME, name: 'save2' });
      save({ type: SAVE_GAME, name: 'save3' });
      const expectedSessions = {
        '': 2,
        session2: 3
      };
      // run
      await removeSession('session1');
      // check
      const sessions = await getSessions();
      expect(sessions).toEqual(expectedSessions);
      expect(emit).toHaveBeenCalledWith('game/deleteSession', 'session1');
    });
  });
});
