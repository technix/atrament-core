/* eslint-env jest */
import mockPersistent from '../../__mocks__/persistent';
import mockState from '../../__mocks__/state';

import { emit } from '../../src/utils/emitter';
import hashCode from '../../src/utils/hashcode';

import ink from '../../src/components/ink';
import { playMusic, stopMusic, playSound, playSingleMusic, stopSound } from '../../src/components/sound';
import { load, save, existSave, removeSave, listSaves } from '../../src/components/saves';

import game from '../../src/components/game';

let mockGlobalTags;
let mockScene;
let mockInkContent;
const mockInitLoader = jest.fn(() => Promise.resolve());
const mockLoader = jest.fn(() => Promise.resolve(mockInkContent));
let mockObserver;

const mockGetAssetPath = jest.fn((file) => `${mockState.get().game.$path}/${file}`);

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.mock('../../src/components/ink', () => ({
  initStory: jest.fn(),
  getGlobalTags: jest.fn(() => mockGlobalTags),
  getVariable: jest.fn((v) => `${v}-value`),
  observeVariable: jest.fn((v, handler) => { mockObserver = handler; }),
  getScene: jest.fn(() => JSON.parse(JSON.stringify(mockScene))),
  makeChoice: jest.fn(),
  resetStory: jest.fn()
}));

jest.mock('../../src/components/sound', () => ({
  playMusic: jest.fn(),
  stopMusic: jest.fn(),
  playSound: jest.fn(),
  playSingleMusic: jest.fn(),
  stopSound: jest.fn()
}));

jest.mock('../../src/components/saves', () => ({
  load: jest.fn(async (gameSaveId) => {
    const exists = await mockPersistent.exists(gameSaveId);
    if (exists) {
      const saveContent = await mockPersistent.get(gameSaveId);
      if (saveContent.game) {
        mockState.setKey('game', saveContent.game);
      }
    }
  }),
  save: jest.fn(),
  existSave: jest.fn((saveID) => Promise.resolve(mockPersistent.exists(saveID))),
  removeSave: jest.fn(),
  listSaves: jest.fn(async () => {
    const keys = await mockPersistent.keys();
    const savesList = await Promise.all(keys.map(
      async (key) => { const r = await mockPersistent.get(key); return r; }
    ));
    return savesList;
  })
}));

jest.mock('../../src/utils/interfaces', () => ({
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


beforeEach(() => {
  mockState.reset();
  mockPersistent.reset();
  jest.clearAllMocks();
  mockScene = {};
  mockGlobalTags = [];
  mockObserver = () => {};
});

describe('components/game', () => {
  describe('init', () => {
    test('default', async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      expect(emit).not.toHaveBeenCalled();
      await game.init(pathToInkFile, inkFile);
      expect(mockState.get().game).toEqual({
        $path: pathToInkFile,
        $file: inkFile,
        gameUUID: hashCode(`${pathToInkFile}|${inkFile}`)
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
        gameUUID: 'customUUID'
      });
    });
  });

  test('loadInkFile', async () => {
    mockInkContent = '{"data":"ink content"}';
    const pathToInkFile = '/some/directory';
    const inkFile = 'game.ink.json';
    await game.init(pathToInkFile, inkFile);
    expect(mockLoader).not.toHaveBeenCalled();
    emit.mockClear();
    const inkContent = await game.loadInkFile();
    expect(inkContent).toEqual({ data: 'ink content' });
    expect(mockLoader).toHaveBeenCalledWith(inkFile);
    expect(emit).toHaveBeenCalledWith('game/loadInkFile', inkFile);
  });


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
    expect(emit).toHaveBeenCalledWith('game/clear');
    expect(stopMusic).toHaveBeenCalledTimes(1);
    expect(mockState.get().scenes).toEqual([]);
    expect(mockState.get().vars).toEqual({});
    expect(mockState.get().metadata).toEqual({ ccc: 'ddd' });
    expect(mockState.get().game).toEqual({ ddd: 'eee' });
    expect(ink.resetStory).toHaveBeenCalledTimes(1);
  });

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
    expect(emit).toHaveBeenCalledWith('game/reset');
    expect(stopMusic).toHaveBeenCalledTimes(1);
    expect(mockState.get().scenes).toEqual([]);
    expect(mockState.get().vars).toEqual({});
    expect(mockState.get().metadata).toEqual({});
    expect(mockState.get().game).toEqual({});
  });


  describe('start', () => {
    beforeEach(async () => {
      // reset
      await game.init(null, null, 'NONEXISTENT');
      await game.initInkStory();
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
      await game.initInkStory();
      // run
      await game.start();
      // check
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: undefined });
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(ink.initStory).toHaveBeenCalledWith(mockInkContent);
      expect(stopMusic).toHaveBeenCalledTimes(1);
      expect(mockState.get().scenes).toEqual([]);
      expect(mockState.get().vars).toEqual({});
      expect(mockState.get().metadata).toEqual(mockGlobalTags);
      expect(ink.observeVariable).not.toHaveBeenCalled();
      expect(existSave).not.toHaveBeenCalled();
      expect(load).not.toHaveBeenCalled();
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

    test('load from nonexistant save', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
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
      mockPersistent.set('existingsave', 'content');
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
      // run
      await game.start('existingsave');
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith('existingsave');
      expect(load).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledWith('existingsave');
    });

    test('load from existing save - story is initialized', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      mockPersistent.set('existingsave', 'content');
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
      // run
      await game.start('existingsave');
      // check
      expect(ink.initStory).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledTimes(1);
      expect(existSave).toHaveBeenCalledWith('existingsave');
      expect(load).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledWith('existingsave');
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
      mockPersistent.set(saveID, { game: { $currentMusic: 'music.mp3' } });
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
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
      mockPersistent.set(saveID, { game: { $currentMusic: false } });
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
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
      await game.init(pathToInkFile, inkFile);
    });

    test('start from beginning - same ink story', async () => {
      // set
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      await game.initInkStory();
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
      expect(ink.initStory).toHaveBeenCalledWith({ inkstory: 'inkContent' });
      expect(ink.observeVariable).not.toHaveBeenCalled();
      expect(load).not.toHaveBeenCalled();
    });
  });

  describe('canResume', () => {
    test('default', async () => {
      const expectedSaveslot = undefined;
      const canResume = await game.canResume();
      expect(emit).toHaveBeenCalledWith('game/canResume', expectedSaveslot);
      expect(canResume).toBe(expectedSaveslot);
    });

    test('autosave', async () => {
      // set
      mockPersistent.set('_autosave_', 'autosave_content');
      const expectedSaveslot = '_autosave_';
      // run
      const canResume = await game.canResume();
      // check
      expect(emit).toHaveBeenCalledWith('game/canResume', expectedSaveslot);
      expect(canResume).toBe(expectedSaveslot);
    });

    test('checkpoints', async () => {
      // set
      mockPersistent.set('_autosave_', 'autosave_content');
      mockPersistent.set('checkpoint/point1', { id: 'checkpoint/point1', date: Date.now() - 100 });
      mockPersistent.set('checkpoint/point2', { id: 'checkpoint/point2', date: Date.now() - 1000 });
      mockPersistent.set('checkpoint/point3', { id: 'checkpoint/point3', date: Date.now() });
      const expectedSaveslot = '_autosave_'; // autosave has higher precedence
      // run
      const canResume = await game.canResume();
      // check
      expect(emit).toHaveBeenCalledWith('game/canResume', expectedSaveslot);
      expect(canResume).toBe(expectedSaveslot);
    });

    test('both autosave and checkpoints', async () => {
      // set
      mockPersistent.set('checkpoint/point1', { id: 'checkpoint/point1', date: Date.now() - 100 });
      mockPersistent.set('checkpoint/point2', { id: 'checkpoint/point2', date: Date.now() - 1000 });
      mockPersistent.set('checkpoint/point3', { id: 'checkpoint/point3', date: Date.now() });
      const expectedSaveslot = 'checkpoint/point3'; // latest checkpoint
      // run
      const canResume = await game.canResume();
      // check
      expect(emit).toHaveBeenCalledWith('game/canResume', expectedSaveslot);
      expect(canResume).toBe(expectedSaveslot);
    });
  });

  describe('resume', () => {
    beforeEach(async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
    });

    test('cannot resume - start again', async () => {
      expect(ink.resetStory).not.toHaveBeenCalled();
      await game.resume();
      expect(emit).toHaveBeenCalledWith('game/resume', { saveSlot: undefined });
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: undefined });
      expect(load).not.toHaveBeenCalled();
      expect(ink.resetStory).toHaveBeenCalledTimes(1);
    });

    test('can resume - start from save', async () => {
      expect(ink.resetStory).not.toHaveBeenCalled();
      const saveID = '_autosave_';
      mockPersistent.set(saveID, 'autosave_content');
      await game.resume();
      expect(emit).toHaveBeenCalledWith('game/resume', { saveSlot: saveID });
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: saveID });
      expect(load).toHaveBeenCalledWith(saveID);
      expect(ink.resetStory).toHaveBeenCalledTimes(1);
    });
  });

  describe('restart', () => {
    beforeEach(async () => {
      const pathToInkFile = '/some/directory';
      const inkFile = 'game.ink.json';
      await game.init(pathToInkFile, inkFile);
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
    });

    test('save slot is not set', async () => {
      expect(ink.resetStory).not.toHaveBeenCalled();
      expect(ink.getScene).not.toHaveBeenCalled();
      const saveID = '_autosave_';
      mockPersistent.set(saveID, 'autosave_content');
      await game.restart();
      expect(emit).toHaveBeenCalledWith('game/restart', { saveSlot: undefined });
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: undefined });
      expect(load).not.toHaveBeenCalled();
      expect(ink.resetStory).toHaveBeenCalledTimes(1);
      expect(ink.getScene).toHaveBeenCalledTimes(1);
    });

    test('save slot is set', async () => {
      expect(ink.resetStory).not.toHaveBeenCalled();
      expect(ink.getScene).not.toHaveBeenCalled();
      const saveID = '_autosave_';
      mockPersistent.set(saveID, 'autosave_content');
      await game.restart(saveID);
      expect(emit).toHaveBeenCalledWith('game/restart', { saveSlot: saveID });
      expect(emit).toHaveBeenCalledWith('game/start', { saveSlot: saveID });
      expect(load).toHaveBeenCalledWith(saveID);
      expect(ink.resetStory).toHaveBeenCalledTimes(1);
      expect(ink.getScene).toHaveBeenCalledTimes(1);
    });
  });

  describe('continueStory', () => {
    const pathToInkFile = '/some/directory';
    const inkFile = 'game.ink.json';
    const processedMockScene = {
      content: [{ text: 'aaa', images: [] }],
      text: ['aaaa'],
      tags: {},
      choices: [],
      images: []
    };
    beforeEach(async () => {
      await game.init(pathToInkFile, inkFile);
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
    });

    test('scene with empty content', () => {
      mockScene = { content: [] };
      game.continueStory();
      expect(mockState.get().scenes).toEqual([]);
    });

    test('scene basics', () => {
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      game.continueStory();
      expect(emit).toHaveBeenCalledWith('game/continueStory');
      expect(mockState.get().scenes).toEqual([processedMockScene]);
      game.continueStory();
      expect(mockState.get().scenes).toEqual([processedMockScene, processedMockScene]);
      expect(save).toHaveBeenCalledWith('_autosave_'); // autosave by default
    });

    test('scene - single scene', () => {
      mockState.setKey('metadata', { single_scene: true });
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      game.continueStory();
      expect(emit).toHaveBeenCalledWith('game/continueStory');
      expect(mockState.get().scenes).toEqual([processedMockScene]);
      game.continueStory();
      expect(mockState.get().scenes).toEqual([processedMockScene]);
    });

    test('scene - autosave mode', () => {
      mockState.setKey('metadata', { autosave: true });
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      expect(save).not.toHaveBeenCalled();
      game.continueStory();
      expect(emit).toHaveBeenCalledWith('game/continueStory');
      expect(mockState.get().scenes).toEqual([processedMockScene]);
      expect(save).toHaveBeenCalledWith('_autosave_');
    });

    test('scene - autosave disabled', () => {
      mockState.setKey('metadata', { autosave: false });
      mockScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
      expect(save).not.toHaveBeenCalled();
      game.continueStory();
      expect(emit).toHaveBeenCalledWith('game/continueStory');
      expect(mockState.get().scenes).toEqual([processedMockScene]);
      expect(save).not.toHaveBeenCalled();
    });

    describe('tags', () => {
      let sampleScene;
      let processedSampleScene;
      beforeEach(() => {
        sampleScene = { content: [{ text: 'aaa' }], text: ['aaaa'], tags: {}, choices: [] };
        processedSampleScene = { ...sampleScene, content: [{ text: 'aaa', images: [] }], images: [] };
      });

      test('CLEAR', () => {
        mockScene = { ...sampleScene };
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/continueStory');
        expect(mockState.get().scenes).toEqual([processedSampleScene]);
        game.continueStory();
        expect(mockState.get().scenes).toEqual([processedSampleScene, processedSampleScene]);
        mockScene = { ...sampleScene, tags: { CLEAR: true } };
        game.continueStory();
        expect(mockState.get().scenes).toEqual([{ ...processedSampleScene, tags: { CLEAR: true } }]);
      });

      test('AUDIO - start', () => {
        const soundFile = 'sound.mp3';
        mockScene = { ...sampleScene, tags: { AUDIO: soundFile } };
        expect(playSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { AUDIO: soundFile });
        expect(playSound).toHaveBeenCalledWith(soundFile);
        expect(playMusic).not.toHaveBeenCalled();
      });

      test('AUDIO - stop', () => {
        const soundFile = false;
        mockScene = { ...sampleScene, tags: { AUDIO: soundFile } };
        expect(stopSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { AUDIO: soundFile });
        expect(stopSound).toHaveBeenCalledTimes(1);
        expect(stopSound).toHaveBeenCalledWith();
        expect(stopMusic).not.toHaveBeenCalled();
      });

      test('AUDIO - start multiple files', () => {
        const soundFile1 = 'sound.mp3';
        const soundFile2 = 'sound.mp3';
        mockScene = { ...sampleScene, tags: { AUDIO: [soundFile1, soundFile2] } };
        expect(playSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { AUDIO: [soundFile1, soundFile2] });
        expect(playSound).toHaveBeenCalledWith([soundFile1, soundFile2]);
        expect(playMusic).not.toHaveBeenCalled();
      });

      test('AUDIOLOOP - start', () => {
        const musicFile = 'music.mp3';
        mockScene = { ...sampleScene, tags: { AUDIOLOOP: musicFile } };
        expect(playSingleMusic).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { AUDIOLOOP: musicFile });
        expect(playSingleMusic).toHaveBeenCalledWith(musicFile);
        expect(playSound).not.toHaveBeenCalled();
      });

      test('AUDIOLOOP - stop', () => {
        const musicFile = false;
        mockScene = { ...sampleScene, tags: { AUDIOLOOP: musicFile } };
        expect(stopMusic).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { AUDIOLOOP: musicFile });
        expect(stopMusic).toHaveBeenCalledTimes(1);
        expect(stopMusic).toHaveBeenCalledWith();
        expect(stopSound).not.toHaveBeenCalled();
      });

      test('PLAY_SOUND', () => {
        const soundFile = 'sound.mp3';
        mockScene = { ...sampleScene, tags: { PLAY_SOUND: soundFile } };
        expect(playSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { PLAY_SOUND: soundFile });
        expect(playSound).toHaveBeenCalledTimes(1);
        expect(playSound).toHaveBeenCalledWith(soundFile);
        expect(playMusic).not.toHaveBeenCalled();
      });


      test('STOP_SOUND', () => {
        const soundFile = 'sound.mp3';
        mockScene = { ...sampleScene, tags: { STOP_SOUND: soundFile } };
        expect(stopSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { STOP_SOUND: soundFile });
        expect(stopSound).toHaveBeenCalledTimes(1);
        expect(stopSound).toHaveBeenCalledWith(soundFile);
        expect(stopMusic).not.toHaveBeenCalled();
      });

      test('STOP_SOUND - all', () => {
        mockScene = { ...sampleScene, tags: { STOP_SOUND: true } };
        expect(stopSound).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { STOP_SOUND: true });
        expect(stopSound).toHaveBeenCalledTimes(1);
        expect(stopSound).toHaveBeenCalledWith();
        expect(stopMusic).not.toHaveBeenCalled();
      });

      test('PLAY_MUSIC', () => {
        const musicFile = 'music.mp3';
        mockScene = { ...sampleScene, tags: { PLAY_MUSIC: musicFile } };
        expect(playMusic).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { PLAY_MUSIC: musicFile });
        expect(playMusic).toHaveBeenCalledTimes(1);
        expect(playMusic).toHaveBeenCalledWith(musicFile);
        expect(playSound).not.toHaveBeenCalled();
      });

      test('STOP_MUSIC', () => {
        const musicFile = 'music.mp3';
        mockScene = { ...sampleScene, tags: { STOP_MUSIC: musicFile } };
        expect(stopMusic).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { STOP_MUSIC: musicFile });
        expect(stopMusic).toHaveBeenCalledTimes(1);
        expect(stopMusic).toHaveBeenCalledWith(musicFile);
        expect(stopSound).not.toHaveBeenCalled();
      });

      test('STOP_MUSIC - all', () => {
        mockScene = { ...sampleScene, tags: { STOP_MUSIC: true } };
        expect(stopMusic).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { STOP_MUSIC: true });
        expect(stopMusic).toHaveBeenCalledTimes(1);
        expect(stopMusic).toHaveBeenCalledWith();
        expect(stopSound).not.toHaveBeenCalled();
      });

      test('CHECKPOINT - default', () => {
        mockScene = { ...sampleScene, tags: { CHECKPOINT: true } };
        expect(save).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { CHECKPOINT: true });
        expect(save).toHaveBeenCalledWith('checkpoint/_default_');
      });

      test('CHECKPOINT - named', () => {
        mockScene = { ...sampleScene, tags: { CHECKPOINT: 'point1' } };
        expect(save).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { CHECKPOINT: 'point1' });
        expect(save).toHaveBeenCalledWith('checkpoint/point1');
      });

      test('SAVEGAME', () => {
        mockScene = { ...sampleScene, tags: { SAVEGAME: 'point2' } };
        expect(save).not.toHaveBeenCalled();
        game.continueStory();
        expect(emit).toHaveBeenCalledWith('game/handletag', { SAVEGAME: 'point2' });
        expect(save).toHaveBeenCalledWith('point2');
      });

      test('custom scene processor', () => {
        mockScene = { ...sampleScene, tags: { CUSTOMTAG: 'test' } };
        const targetScene = { ...processedSampleScene, tags: { CUSTOMTAG: 'test' }, customtag: 'test' };
        const mockProcessor = jest.fn((s) => { s.customtag = s.tags.CUSTOMTAG; });
        game.defineSceneProcessor(mockProcessor);
        game.continueStory();
        expect(emit).not.toHaveBeenCalledWith('game/handletag', expect.any(Object));
        expect(mockState.get().scenes).toEqual([targetScene]);
      });
    });
  });


  test('getAssetPath', () => {
    const asset = 'aaa';
    expect(mockGetAssetPath).not.toHaveBeenCalled();
    game.getAssetPath(asset);
    expect(mockGetAssetPath).toHaveBeenCalledWith(asset);
  });

  test('makeChoice', () => {
    const id = 1;
    expect(ink.makeChoice).not.toHaveBeenCalled();
    game.makeChoice(id);
    expect(ink.makeChoice).toHaveBeenCalledWith(id);
  });

  test('load', async () => {
    const id = 'saveID';
    expect(load).not.toHaveBeenCalled();
    await game.load(id);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(id);
  });

  test('save', async () => {
    const id = 'saveID';
    expect(save).not.toHaveBeenCalled();
    await game.save(id);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(id);
  });

  test('listSaves', async () => {
    expect(listSaves).not.toHaveBeenCalled();
    await game.listSaves();
    expect(listSaves).toHaveBeenCalledTimes(1);
  });

  test('removeSave', async () => {
    const id = 'saveSlot';
    expect(removeSave).not.toHaveBeenCalled();
    await game.removeSave(id);
    expect(removeSave).toHaveBeenCalledTimes(1);
    expect(removeSave).toHaveBeenCalledWith(id);
  });

  test('existSave', async () => {
    expect(existSave).not.toHaveBeenCalled();
    const x = await game.existSave('someSave');
    expect(existSave).toHaveBeenCalledTimes(1);
    expect(x).toBe(false);
  });

  test('getAutosaveSlot', async () => {
    expect(game.getAutosaveSlot()).toEqual('_autosave_');
  });

  test('getCheckpointSlot - default', async () => {
    expect(game.getCheckpointSlot()).toEqual('checkpoint/_default_');
  });

  test('getCheckpointSlot - by id', async () => {
    expect(game.getCheckpointSlot('scene1')).toEqual('checkpoint/scene1');
  });
});
