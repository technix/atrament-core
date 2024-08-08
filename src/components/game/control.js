import { interfaces } from '../../utils/interfaces';
import { emit } from '../../utils/emitter';

import hashCode from '../../utils/hashcode';

import ink from '../ink';
import { persistentPrefix, load, existSave } from '../saves';
import { playMusic, stopMusic } from '../sound';


let expectedInkScriptUUID = null;
let currentInkScriptUUID = null;

function $iterateObservers(observerHandler) {
  const { state } = interfaces();
  let observers = state.get().metadata.observe;
  if (observers) {
    if (!Array.isArray(observers)) {
      observers = [observers];
    }
    observers.forEach(observerHandler);
  }
}

async function $handlePersistent() {
  const { state, persistent } = interfaces();
  let persistentVars = state.get().metadata.persist;
  if (persistentVars) {
    if (!Array.isArray(persistentVars)) {
      persistentVars = [persistentVars];
    }
    const storeID = persistentPrefix('persist');
    let persistentVarState = {};
    // load persistent data, if possible
    if (await persistent.exists(storeID)) {
      persistentVarState = await persistent.get(storeID);
      Object.entries(persistentVarState).forEach(
        ([k, v]) => ink.setVariable(k, v)
      );
    }
    // register observers for persistent vars
    persistentVars.forEach((variable) => {
      ink.observeVariable(variable, async (name, value) => {
        persistentVarState[name] = value;
        await persistent.set(storeID, persistentVarState);
      });
    });
  }
}


function $clearGameState() {
  const { state } = interfaces();
  // reset state
  state.setKey('scenes', []);
  state.setKey('vars', {});
}

// ===========================================================

export async function init(pathToInkFile, inkFile, gameID) {
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


export async function loadInkFile() {
  const { game } = interfaces().state.get();
  let inkContent = await interfaces().loader.loadInk(game.$file);
  if (typeof inkContent === 'string') {
    inkContent = JSON.parse(inkContent.replace('\uFEFF', ''));
  }
  emit('game/loadInkFile', game.$file);
  return inkContent;
}


export async function initInkStory() {
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


export async function start(saveSlot) {
  const { state } = interfaces();
  stopMusic(); // stop all music
  $clearGameState(); // game state cleanup
  if (currentInkScriptUUID !== expectedInkScriptUUID) {
    // ink content is not from the same game, reload
    await initInkStory();
  }
  // load saved game, if present
  if (saveSlot) {
    if (await existSave(saveSlot)) {
      await load(saveSlot);
      const { game } = state.get();
      // restore music
      if (game.$currentMusic) {
        playMusic(game.$currentMusic);
      }
    }
  }
  await $handlePersistent();
  // read initial state of observed variables
  $iterateObservers((variable) => {
    state.setSubkey('vars', variable, ink.getVariable(variable));
  });
  emit('game/start', { saveSlot });
}


export function clear() {
  stopMusic(); // stop all music
  $clearGameState();
  ink.resetStory(); // reset ink story state
  emit('game/clear');
}

export function reset() {
  const { state } = interfaces();
  clear();
  // clean metadata and game
  state.setKey('metadata', {});
  state.setKey('game', {});
  emit('game/reset');
}