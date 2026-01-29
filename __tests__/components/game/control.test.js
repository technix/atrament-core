/* eslint-env jest */
import mockPersistent from '../../../src/interfaces/persistent';
import mockState from '../../../src/interfaces/state';

import { emit } from '../../../src/utils/emitter';
import hashCode from '../../../src/utils/hashcode';

import ink from '../../../src/components/ink';
import { persistentPrefix, load, existSave, save, SAVE_GAME, getSaveSlotKey } from '../../../src/components/saves';
import { playMusic, stopMusic } from '../../../src/components/sound';

import game from '../../../src/components/game';

let mockGlobalTags;
let mockObserver;
let mockInkContent;
let mockScene;
const mockInkState = { inkState: true };
const mockLoader = jest.fn(() => Promise.resolve(mockInkContent));
const mockInitLoader = jest.fn(() => Promise.resolve());
const mockGetAssetPath = jest.fn((file) => `${mockState.get().game.$path}/${file}`);

jest.mock('../../../src/components/sound', () => ({
  playMusic: jest.fn(),
  stopMusic: jest.fn()
}));

jest.mock('../../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../../src/components/ink', () => ({
  initStory: jest.fn(),
  getVariable: jest.fn((v) => `${v}-value`),
  setVariable: jest.fn(),
  observeVariable: jest.fn((v, handler) => { mockObserver = handler; }),
  getGlobalTags: jest.fn(() => mockGlobalTags),
  getScene: jest.fn(() => JSON.parse(JSON.stringify(mockScene))),
  resetStory: jest.fn(),
  getState: jest.fn(() => mockInkState),
  loadState: jest.fn(() => mockInkState)
}));

jest.mock('../../../src/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
    persistent: mockPersistent,
    loader: {
      init: mockInitLoader,
      loadInk: mockLoader,
      getAssetPath: mockGetAssetPath
    }
  }))
}));

jest.mock('../../../src/components/saves', () => {
  const saves = jest.requireActual('../../../src/components/saves');
  return {
    ...saves,
    load: jest.spyOn(saves, 'load'),
    save: jest.spyOn(saves, 'save'),
    existSave: jest.spyOn(saves, 'existSave')
  };
});


beforeEach(() => {
  mockState.reset();
  mockPersistent.reset();
  jest.clearAllMocks();
  mockScene = {};
  mockGlobalTags = [];
  mockObserver = () => {};
});


describe('components/game', () => {
  // ============================================================
  // init
  // ============================================================
  describe('init', () => {
    test('default', async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      expect(emit).not.toHaveBeenCalled();
      await game.init(pathToInkFile, inkFile);
      expect(mockState.get().game).toEqual({
        $path: pathToInkFile,
        $file: inkFile,
        $gameUUID: hashCode(`${pathToInkFile}|${inkFile}`)
      });
      expect(mockInitLoader).toHaveBeenCalledWith(pathToInkFile);
      expect(emit).toHaveBeenCalledWith('game/init', { pathToInkFile, inkFile });
    });

    test('init - custom game UUID', async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      expect(emit).not.toHaveBeenCalled();
      await game.init(pathToInkFile, inkFile, 'customUUID');
      expect(mockState.get().game).toEqual({
        $path: pathToInkFile,
        $file: inkFile,
        $gameUUID: 'customUUID'
      });
    });
  });

  // ============================================================
  // loadInkFile
  // ============================================================
  test('loadInkFile', async () => {
    mockInkContent = '{"data":"ink content"}';
    const pathToInkFile = '/some/directory';
    const inkFile = 'game.ink.json';
    await game.init(pathToInkFile, inkFile);
    expect(mockLoader).not.toHaveBeenCalled();
    emit.mockClear();
    const inkContent = await game.loadInkFile();
    expect(inkContent).toEqual(mockInkContent);
    expect(mockLoader).toHaveBeenCalledWith(inkFile);
    expect(emit).toHaveBeenCalledWith('game/loadInkFile', inkFile);
  });

  // ============================================================
  // clear
  // ============================================================
  test('clear', async () => {
    // setup
    expect(emit).not.toHaveBeenCalled();
    mockState.setKey('scenes', [{ text: 'aaa' }, { text: 'aaa' }]);
    mockState.setKey('vars', { aaa: 'bbb' });
    mockState.setKey('metadata', { ccc: 'ddd' });
    mockState.setKey('game', { ddd: 'eee' });
    expect(stopMusic).not.toHaveBeenCalled();
    expect(ink.resetStory).not.toHaveBeenCalled();
    // run
    game.clear();
    // check
    expect(stopMusic).toHaveBeenCalledTimes(1);
    expect(mockState.get().scenes).toEqual([]);
    expect(mockState.get().vars).toEqual({});
    expect(mockState.get().metadata).toEqual({ ccc: 'ddd' });
    expect(mockState.get().game).toEqual({ ddd: 'eee' });
    expect(ink.resetStory).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('game/clear');
  });

  // ============================================================
  // reset
  // ============================================================
  test('reset', async () => {
    // setup
    expect(emit).not.toHaveBeenCalled();
    mockState.setKey('scenes', [{ text: 'aaa' }, { text: 'aaa' }]);
    mockState.setKey('vars', { aaa: 'bbb' });
    mockState.setKey('metadata', { ccc: 'ddd' });
    mockState.setKey('game', { ddd: 'eee' });
    expect(stopMusic).not.toHaveBeenCalled();
    // run
    game.reset();
    // check
    expect(stopMusic).toHaveBeenCalledTimes(1);
    expect(mockState.get().scenes).toEqual([]);
    expect(mockState.get().vars).toEqual({});
    expect(mockState.get().metadata).toEqual({});
    expect(mockState.get().game).toEqual({});
    expect(emit).toHaveBeenCalledWith('game/reset');
  });

  // ============================================================
  // start
  // ============================================================
  describe('start', () => {
    const processedMockScene = {
      content: [{ text: 'aaa', images: [], sounds: [], music: [] }],
      text: ['aaaa'],
      tags: {},
      choices: [],
      images: [],
      sounds: [],
      music: []
    };

    beforeEach(async () => {
      // reset
      await game.init(null, null, 'NONEXISTENT');
      await game.initInkStory();
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      jest.clearAllMocks();
    });

    test('default', async () => {
      // set
      mockInkContent = { inkstory: 'inkContent' };
      mockGlobalTags = { globaltag1: true, globaltag2: true };
      mockState.setKey('scenes', [{ text: 'aaa' }, { text: 'aaa' }]);
      mockState.setKey('vars', { aaa: 'bbb' });
      mockState.setKey('metadata', { ccc: 'ddd' });
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start();
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(ink.initStory).toHaveBeenCalledWith(mockInkContent, `${pathToInkFile}/${inkFile}`);
      expect(stopMusic).toHaveBeenCalledTimes(1);
      expect(mockState.get().scenes).toEqual([processedMockScene]);
      expect(mockState.get().vars).toEqual({});
      expect(mockState.get().metadata).toEqual(mockGlobalTags);
      expect(ink.observeVariable).not.toHaveBeenCalled();
      expect(existSave).not.toHaveBeenCalled();
      expect(load).not.toHaveBeenCalled();
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: undefined });
    });

    test('restore single observer', async () => {
      // set
      mockGlobalTags = { observe: 'var1' };
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      expect(mockState.get().vars).toEqual({});
      // run
      await game.initInkStory();
      // expect observers to be registered, but values are not set yet
      expect(mockState.get().metadata).toEqual(mockGlobalTags);
      expect(ink.observeVariable).toHaveBeenCalledTimes(1);
      expect(ink.observeVariable).toHaveBeenCalledWith('var1', expect.any(Function));
      expect(mockState.get().vars).toEqual({});
      // run
      await game.start();
      // check
      expect(mockState.get().vars).toEqual({
        var1: 'var1-value'
      });
      expect(load).not.toHaveBeenCalled();
      // check observers
      emit.mockClear();
      mockObserver('var1', 50);
      expect(mockState.get().vars).toEqual({
        var1: 50
      });
      expect(emit).toHaveBeenCalledWith('ink/variableObserver', { name: 'var1', value: 50 });
    });

    test('restore observers', async () => {
      // set
      mockGlobalTags = { observe: ['var1', 'var2'] };
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      expect(mockState.get().vars).toEqual({});
      // run
      await game.initInkStory();
      // expect observers to be registered, but values are not set yet
      expect(mockState.get().metadata).toEqual(mockGlobalTags);
      expect(ink.observeVariable).toHaveBeenCalledTimes(2);
      expect(ink.observeVariable).toHaveBeenCalledWith('var1', expect.any(Function));
      expect(ink.observeVariable).toHaveBeenCalledWith('var2', expect.any(Function));
      expect(mockState.get().vars).toEqual({});
      // run
      await game.start();
      // check
      expect(mockState.get().vars).toEqual({
        var1: 'var1-value',
        var2: 'var2-value'
      });
      expect(load).not.toHaveBeenCalled();
      // check observers
      emit.mockClear();
      mockObserver('var1', 50);
      expect(mockState.get().vars).toEqual({
        var1: 50,
        var2: 'var2-value'
      });
      expect(emit).toHaveBeenCalledWith('ink/variableObserver', { name: 'var1', value: 50 });
    });

    test('handle persistent vars', async () => {
      // set
      mockGlobalTags = { persist: ['var1', 'var2'] };
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      const persistentStore = persistentPrefix('persist');
      expect(mockState.get().vars).toEqual({});
      // run
      await game.start();
      // expect observers to be registered, but no data are saved
      expect(mockState.get().metadata).toEqual(mockGlobalTags);
      expect(ink.observeVariable).toHaveBeenCalledTimes(2);
      expect(ink.observeVariable).toHaveBeenCalledWith('var1', expect.any(Function));
      expect(ink.observeVariable).toHaveBeenCalledWith('var2', expect.any(Function));
      expect(await mockPersistent.exists(persistentStore)).toEqual(false);
      await mockObserver('var1', 50);
      const state1 = await mockPersistent.get(persistentStore);
      expect(state1).toEqual({ var1: 50 });
      expect(ink.setVariable).not.toHaveBeenCalled();
      // reinit the game
      // run
      await game.start();
      expect(ink.setVariable).toHaveBeenCalledTimes(1);
      expect(ink.setVariable).toHaveBeenCalledWith('var1', 50);
    });

    test('load from nonexistent save', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start('somesave');
      // check
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith('somesave');
      expect(load).not.toHaveBeenCalled();
    });

    test('load from existing save', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      const saveID = getSaveSlotKey({ type: SAVE_GAME, name: 'existingsave' });
      save({ type: SAVE_GAME, name: 'existingsave' });
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start(saveID);
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith(saveID);
      expect(load).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledWith(saveID);
      expect(ink.getScene).toHaveBeenCalledTimes(1); // runs continueStory
    });

    test('load from existing save with continue_maximally:false', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      mockGlobalTags = { continue_maximally: false };
      const saveID = getSaveSlotKey({ type: SAVE_GAME, name: 'existingsave' });
      save({ type: SAVE_GAME, name: 'existingsave' });
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start(saveID);
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith(saveID);
      expect(load).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledWith(saveID);
      expect(ink.getScene).toHaveBeenCalledTimes(0); // continueStory does not run
    });

    test('load from existing save - story is initialized', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      const saveID = getSaveSlotKey({ type: SAVE_GAME, name: 'existingsave' });
      save({ type: SAVE_GAME, name: 'existingsave' });
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start(saveID);
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith(saveID);
      expect(load).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledWith(saveID);
    });

    test('load ink file while starting', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      mockInkContent = null; // reset ink content
      await game.loadInkFile();
      mockLoader.mockClear();
      // run
      await game.start();
      // check
      expect(mockLoader).toHaveBeenCalledWith(inkFile);
      expect(emit).toHaveBeenCalledWith('game/loadInkFile', inkFile);
    });

    test('load game state - restore music', async () => {
      // set
      const saveID = 'test_save_id';
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      mockPersistent.set(saveID, { game: { $currentMusic: 'music.mp3' }, scenes: [] });
      await game.init(pathToInkFile, inkFile);
      // run
      expect(playMusic).not.toHaveBeenCalled();
      await game.start(saveID);
      // check
      expect(playMusic).toHaveBeenCalledWith('music.mp3');
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: saveID });
    });

    test('load game state - restore music - false', async () => {
      // set
      const saveID = 'test_save_id';
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      mockPersistent.set(saveID, { game: { $currentMusic: false }, scenes: [] });
      await game.init(pathToInkFile, inkFile);
      // run
      expect(playMusic).not.toHaveBeenCalled();
      await game.start(saveID);
      // check
      expect(playMusic).not.toHaveBeenCalled();
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: saveID });
    });
  });

  describe('start of the same story', () => {
    beforeEach(async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      await game.init(pathToInkFile, inkFile);
    });

    test('start from beginning - same ink story', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      // run
      await game.start();
      // check
      expect(ink.initStory).not.toHaveBeenCalled(); // this story is already initialized
      expect(ink.observeVariable).not.toHaveBeenCalled();
      expect(load).not.toHaveBeenCalled();
    });

    test('other story + ink content as string', async () => {
      // set
      mockInkContent = '{"inkstory":"inkContent"}';
      const pathToInkFile = '/some/directory2';
      const inkFile = 'game2.ink.json';
      await game.init(pathToInkFile, inkFile);
      await game.loadInkFile();
      // run
      await game.start();
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(ink.initStory).toHaveBeenCalledWith(mockInkContent, `${pathToInkFile}/${inkFile}`);
      expect(ink.observeVariable).not.toHaveBeenCalled();
      expect(load).not.toHaveBeenCalled();
    });
  });
});
