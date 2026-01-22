import { interfaces } from '../../interfaces';
import { emit } from '../../utils/emitter';
import toArray from '../../utils/to-array';
import hashCode from '../../utils/hashcode';

import { getSession, setSession, getSessions, removeSession } from './sessions';

import ink from '../ink';
import { playSound, stopSound, playMusic, playSingleMusic, stopMusic } from '../sound';
import {
  persistentPrefix,
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
} from '../saves';

import internalSceneProcessors from '../../utils/scene-processors';

// ===========================================

let expectedInkScriptUUID = null;
let currentInkScriptUUID = null;

const sceneProcessors = [];

const persistentVarState = {};

// ===========================================
// Internal functions

function $clearGameState() {
  const { state } = interfaces();
  // reset state
  state.setKey('scenes', []);
  state.setKey('vars', {});
}


function $iterateObservers(observerHandler) {
  const { state } = interfaces();
  const observers = state.get().metadata.observe;
  if (observers) {
    toArray(observers).forEach(observerHandler);
  }
}


async function $handlePersistent() {
  const { state, persistent } = interfaces();
  const { game, metadata } = state.get();
  const persistentVars = metadata.persist;
  if (persistentVars) {
    const storeID = persistentPrefix('persist');
    // load persistent data, if possible
    if (await persistent.exists(storeID)) {
      persistentVarState[game.$gameUUID] = await persistent.get(storeID);
      Object.entries(persistentVarState[game.$gameUUID]).forEach(
        ([k, v]) => ink.setVariable(k, v)
      );
    } else if (!persistentVarState[game.$gameUUID]) {
      persistentVarState[game.$gameUUID] = {};
    }
    // register observers for persistent vars
    toArray(persistentVars).forEach((variable) => {
      ink.observeVariable(variable, async (name, value) => {
        persistentVarState[game.$gameUUID][name] = value;
        await persistent.set(storeID, persistentVarState[game.$gameUUID]);
      });
    });
  }
}


// ===========================================
// Exported functions


async function init(pathToInkFile, inkFile, gameID) {
  await interfaces().loader.init(pathToInkFile);
  const gameObj = {
    $path: pathToInkFile,
    $file: inkFile,
    $gameUUID: gameID || hashCode(`${pathToInkFile}|${inkFile}`)
  };
  interfaces().state.setKey('game', gameObj);
  expectedInkScriptUUID = gameObj.$gameUUID; // expecting to load content with this UUID
  emit('game/init', { pathToInkFile, inkFile });
}


async function loadInkFile() {
  const { game } = interfaces().state.get();
  let inkContent = await interfaces().loader.loadInk(game.$file);
  if (typeof inkContent === 'string') {
    try {
      inkContent = JSON.parse(inkContent.replace('\uFEFF', ''));
    } catch (e) {
      console.error(e);
      throw Error(`Failed to parse Ink script: ${game.$path}/${game.$file}`);
    }
  }
  emit('game/loadInkFile', game.$file);
  return inkContent;
}


async function initInkStory() {
  const { state } = interfaces();
  const inkContent = await loadInkFile();
  // initialize InkJS
  ink.initStory(inkContent);
  // read global tags
  const metadata = ink.getGlobalTags();
  state.setKey('metadata', metadata);
  // register variable observers
  $iterateObservers((variable) => {
    ink.observeVariable(variable, (name, value) => {
      state.setSubkey('vars', name, value);
      emit('ink/variableObserver', { name, value });
    });
  });
  currentInkScriptUUID = expectedInkScriptUUID;
  emit('game/initInkStory');
}


async function start(saveSlot) {
  const { state } = interfaces();
  stopMusic(); // stop all music
  $clearGameState(); // game state cleanup
  if (currentInkScriptUUID !== expectedInkScriptUUID) {
    // ink content is not from the same game, reload
    await initInkStory();
  }
  // load saved game, if present
  let isNewGame = true;
  if (saveSlot) {
    if (await existSave(saveSlot)) {
      await load(saveSlot);
      const { game } = state.get();
      // restore music
      if (game.$currentMusic) {
        playMusic(game.$currentMusic);
      }
      isNewGame = false;
    }
  }
  await $handlePersistent();
  // read initial state of observed variables
  $iterateObservers((variable) => {
    state.setSubkey('vars', variable, ink.getVariable(variable));
  });
  // need to run continueStory in the following cases:
  // 1. This is a new game
  // 2. This is a loaded game, and 'continue_maximally' is not set to true
  emit('game/start', { saveSlot });
  if (isNewGame || (!isNewGame && state.get().metadata.continue_maximally !== false)) {
    continueStory();
  }
}


async function canResume() {
  let saveSlot = null;
  const autosaveSlot = getSaveSlotKey({ type: SAVE_AUTOSAVE });
  if (await existSave(autosaveSlot)) {
    saveSlot = autosaveSlot;
  } else {
    const saves = await listSaves();
    const checkpoints = saves.filter((k) => k.type === SAVE_CHECKPOINT);
    if (checkpoints.length) {
      saveSlot = checkpoints.sort((a, b) => b.date - a.date)[0].id;
    }
  }
  emit('game/canResume', saveSlot);
  return saveSlot;
}


async function resume() {
  const saveSlot = await canResume();
  emit('game/resume', { saveSlot });
  ink.resetStory(); // reset ink story state
  await start(saveSlot);
}


async function restart(saveSlot) {
  emit('game/restart', { saveSlot });
  ink.resetStory(); // reset ink story state
  await start(saveSlot);
}

async function restartFromCheckpoint(checkpointName) {
  await restart(getSaveSlotKey({ type: 'checkpoint', name: checkpointName }));
}


function clear() {
  stopMusic(); // stop all music
  $clearGameState();
  ink.resetStory(); // reset ink story state
  emit('game/clear');
}


function reset() {
  const { state } = interfaces();
  clear();
  // clean metadata and game
  state.setKey('metadata', {});
  state.setKey('game', {});
  emit('game/reset');
}


async function saveGame(name) {
  await save({ type: SAVE_GAME, name });
}


async function saveCheckpoint(name) {
  await save({ type: SAVE_CHECKPOINT, name });
}


async function saveAutosave() {
  await save({ type: SAVE_AUTOSAVE });
}


const tagHandlers = {
  CLEAR: () => interfaces().state.setKey('scenes', []),
  AUDIO: (v) => (v ? playSound(v) : stopSound()),
  AUDIOLOOP: (v) => (v ? playSingleMusic(v) : stopMusic()),
  PLAY_SOUND: playSound,
  STOP_SOUND: (v) => (v === true ? stopSound() : stopSound(v)),
  PLAY_MUSIC: playMusic,
  STOP_MUSIC: (v) => (v === true ? stopMusic() : stopMusic(v)),
  CHECKPOINT: (v) => saveCheckpoint(v),
  SAVEGAME: (v) => saveGame(v)
};


function $processTags(list, tags) {
  list.forEach((tag) => {
    if (tag in tags && tag in tagHandlers) {
      tagHandlers[tag](tags[tag]);
      emit('game/handletag', { [tag]: tags[tag] });
    }
  });
}


function defineSceneProcessor(fn) {
  sceneProcessors.push(fn);
}


function continueStory() {
  const { state } = interfaces();
  const { metadata } = state.get();
  // get next scene
  const isContinueMaximally = !(metadata.continue_maximally === false);
  const scene = ink.getScene(isContinueMaximally);
  if (!scene.content || scene.content.length === 0) {
    /*
      if we have a scene with empty content
      (usually it happens after state load)
      do not process it further
    */
    return;
  }
  // run scene processors
  internalSceneProcessors.forEach((p) => p(scene));
  sceneProcessors.forEach((p) => p(scene));
  // process tags
  const { tags } = scene;

  // RESTART
  if (tags.RESTART) {
    restart();
    return;
  }

  // RESTART_FROM_CHECKPOINT
  if (tags.RESTART_FROM_CHECKPOINT) {
    restartFromCheckpoint(tags.RESTART_FROM_CHECKPOINT);
    return;
  }

  // tags to do pre-render actions
  $processTags(
    ['CLEAR', 'STOP_SOUND', 'STOP_MUSIC', 'PLAY_SOUND', 'PLAY_MUSIC', 'AUDIO', 'AUDIOLOOP'],
    tags
  );

  if (metadata.single_scene) {
    // put single scene to state
    state.setKey('scenes', [scene]);
  } else {
    // add scene to state
    state.appendKey('scenes', scene);
  }

  // handle game saves
  $processTags(
    ['CHECKPOINT', 'SAVEGAME'],
    tags
  );

  // if autosave mode is not disabled
  if (metadata.autosave !== false) {
    saveAutosave();
  }
  emit('game/continueStory');
}


export default {
  // game-control
  init,
  loadInkFile,
  initInkStory,
  start,
  clear,
  reset,
  // game
  resume,
  canResume,
  restart,
  restartFromCheckpoint,
  continueStory,
  makeChoice: (id) => ink.makeChoice(id),
  getAssetPath: (path) => interfaces().loader.getAssetPath(path),
  defineSceneProcessor,
  // saves
  SAVE_GAME,
  SAVE_AUTOSAVE,
  SAVE_CHECKPOINT,
  getSaveSlotKey,
  saveGame,
  saveCheckpoint,
  saveAutosave,
  load,
  getState,
  setState,
  listSaves,
  removeSave,
  existSave,
  // sessions
  getSession,
  setSession,
  getSessions,
  removeSession
};
