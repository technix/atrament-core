import { interfaces } from '../utils/interfaces';
import { emit } from '../utils/emitter';
import hashCode from '../utils/hashcode';

import ink from './ink';
import { playSound, stopSound, playMusic, playSingleMusic, stopMusic } from './sound';
import { load, save, existSave, removeSave, listSaves } from './saves';

let inkContent;
let inkContentSource;
const sceneProcessors = [];
const autosaveSlot = '_autosave_';

function $getCheckpointName(id) {
  let saveId = id;
  if (typeof id === 'boolean' || !id) {
    saveId = '_default_';
  }
  return `checkpoint/${saveId}`;
}

// ===========================================

async function init(pathToInkFile, inkFile, gameID) {
  inkContentSource = false;
  await interfaces().loader.init(pathToInkFile);
  interfaces().state.setKey('game', {
    $path: pathToInkFile,
    $file: inkFile,
    gameUUID: gameID || hashCode(`${pathToInkFile}|${inkFile}`)
  });
  emit('game/init', { pathToInkFile, inkFile });
}


async function loadInkFile() {
  const { game } = interfaces().state.get();
  inkContent = await interfaces().loader.loadInk(game.$file);
  if (typeof inkContent === 'string') {
    inkContent = JSON.parse(inkContent.replace('\uFEFF', ''));
  }
  emit('game/loadInkFile', game.$file);
}


async function initInkStory() {
  const { state } = interfaces();
  // load content if it's not loaded, or it's not for the same game
  if (!inkContent) {
    await loadInkFile();
  }
  // initialize InkJS
  ink.initStory(inkContent);
  // read global tags
  const metadata = ink.getGlobalTags();
  state.setKey('metadata', metadata);
  // update ink source
  inkContentSource = true;
  emit('game/initInkStory');
}

function $registerObservers() {
  const { state } = interfaces();
  const observers = state.get().metadata.observe;
  if (observers) {
    observers.forEach((variable) => {
      // save initial value to state
      state.setSubkey('vars', variable, ink.getVariable(variable));
      // register variable observer
      ink.observeVariable(variable, (name, value) => {
        state.setSubkey('vars', name, value);
        emit('ink/variableObserver', { name, value });
      });
    });
  }
}

async function start(saveSlot) {
  // game state cleanup
  clear();
  // initialize ink story:
  // - it it's not done yet
  // - if we start a new game
  // TODO: write test for '!saveSlot' behavior
  if (!inkContentSource || !saveSlot) {
    await initInkStory();
  }
  // register variable observers
  $registerObservers();
  // load saved game, if present
  if (saveSlot) {
    if (await existSave(saveSlot)) {
      await load(saveSlot);
    }
  }
  emit('game/start', { saveSlot });
}

function clear() {
  const { state } = interfaces();
  // stop all music
  stopMusic();
  // reset state
  state.setKey('scenes', []);
  state.setKey('vars', {});
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

async function canResume() {
  let saveSlot;
  if (await existSave(autosaveSlot)) {
    saveSlot = autosaveSlot;
  } else {
    const saves = await listSaves();
    const checkpoints = saves.filter((k) => k.id.includes('checkpoint/'));
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
  await start(saveSlot);
}


async function restart(saveSlot) {
  emit('game/restart', { saveSlot });
  await start(saveSlot);
  continueStory();
}


const tagHandlers = {
  CLEAR: () => interfaces().state.setKey('scenes', []),
  AUDIO: (v) => (v ? playSound(v) : stopSound()),
  AUDIOLOOP: (v) => (v ? playSingleMusic(v) : stopMusic()),
  PLAY_SOUND: playSound,
  STOP_SOUND: (v) => (v === true ? stopSound() : stopSound(v)),
  PLAY_MUSIC: playMusic,
  STOP_MUSIC: (v) => (v === true ? stopMusic() : stopMusic(v)),
  CHECKPOINT: (v) => {
    save($getCheckpointName(v));
  },
  SAVEGAME: (v) => save(v)
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
  // get next scene
  const scene = ink.getScene();
  if (scene.content.length === 0) {
    /*
      if we have a scene with empty content
      (usually it happens after state load)
      do not process it further
    */
    return;
  }
  // run scene processors
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
    restart($getCheckpointName(tags.RESTART_FROM_CHECKPOINT));
    return;
  }

  // tags to do pre-render actions
  $processTags(
    ['CLEAR', 'STOP_SOUND', 'STOP_MUSIC', 'PLAY_SOUND', 'PLAY_MUSIC', 'AUDIO', 'AUDIOLOOP'],
    tags
  );

  const { metadata } = state.get();
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
    save(autosaveSlot);
  }
  emit('game/continueStory');
}


export default {
  init,
  loadInkFile,
  initInkStory,
  start,
  resume,
  canResume,
  restart,
  clear,
  reset,
  continueStory,
  makeChoice: (id) => ink.makeChoice(id),
  getAssetPath: (path) => interfaces().loader.getAssetPath(path),
  defineSceneProcessor,
  save,
  load,
  listSaves,
  removeSave,
  existSave,
  getAutosaveSlot: () => autosaveSlot,
  getCheckpointSlot: (id) => $getCheckpointName(id)
};
