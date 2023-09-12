import { interfaces } from '../utils/interfaces';
import { emit } from '../utils/emitter';
import hashCode from '../utils/hashcode';

import ink from './ink';
import getAssetPath from './assetpath';
import { playMusic, playSound } from './sound';
import { load, save, existSave, removeSave, listSaves } from './saves';

let inkContent;
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

function init(pathToInkFile, inkFile) {
  interfaces().state.setKey('game', {
    $path: pathToInkFile,
    $file: inkFile,
    gameUUID: hashCode(`${pathToInkFile}|${inkFile}`)
  });
  emit('game/init', { pathToInkFile, inkFile });
}


async function loadInkFile() {
  const { game } = interfaces().state.get();
  const uri = getAssetPath(game.$file);
  inkContent = await interfaces().loader.load(uri);
  if (typeof inkContent === 'string') {
    inkContent = JSON.parse(inkContent.replace('\uFEFF', ''));
  }
  emit('game/loadInkFile', { uri });
}


async function start(saveSlot) {
  emit('game/start', { saveSlot });
  // cleanup
  cleanup();
  // load content if not present
  if (!inkContent) {
    await loadInkFile();
  }
  // initialize InkJS
  ink.initStory(inkContent);
  // read global tags
  const { state } = interfaces();
  const metadata = ink.getGlobalTags();
  state.setKey('metadata', metadata);
  // register variable observers
  if (metadata.observe) {
    metadata.observe.forEach((variable) => {
      // save initial value to state
      state.setSubkey('vars', variable, ink.getVariable(variable));
      // register variable observer
      ink.observeVariable(variable, (name, value) => {
        emit('ink/variableObserver', { name, value });
        state.setSubkey('vars', name, value);
      });
    });
  }
  // load saved game, if present
  if (saveSlot) {
    if (await existSave(saveSlot)) {
      await load(saveSlot);
    }
  }
}

function cleanup() {
  const { state } = interfaces();
  // stop all music
  playMusic(false);
  // reset state
  state.setKey('scenes', []);
  state.setKey('vars', {});
  state.setKey('metadata', {});
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
  AUDIOLOOP: playMusic,
  MUSIC: playMusic,
  AUDIO: playSound,
  SOUND: playSound,
  CHECKPOINT: (v) => {
    save($getCheckpointName(v));
  },
  SAVEGAME: (v) => save(v)
};

function $processTags(list, tags) {
  list.forEach((tag) => {
    if (tag in tags && tag in tagHandlers) {
      emit('game/handletag', { [tag]: tags[tag] });
      tagHandlers[tag](tags[tag]);
    }
  });
}


function defineSceneProcessor(fn) {
  sceneProcessors.push(fn);
}


function continueStory() {
  emit('game/continueStory');
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
    ['CLEAR', 'AUDIOLOOP', 'MUSIC', 'AUDIO', 'SOUND'],
    tags
  );

  const { metadata } = state.get();
  if (metadata.single_scene) {
    state.setKey('scenes', []);
  }
  // save scene to store
  state.appendKey('scenes', scene);

  // handle game saves
  $processTags(
    ['CHECKPOINT', 'SAVEGAME'],
    tags
  );

  // if autosave mode is not disabled
  if (metadata.autosave !== false) {
    save(autosaveSlot);
  }
}


export default {
  init,
  loadInkFile,
  start,
  resume,
  canResume,
  restart,
  cleanup,
  continueStory,
  makeChoice: (id) => ink.makeChoice(id),
  getAssetPath,
  defineSceneProcessor,
  save,
  load,
  listSaves,
  removeSave,
  existSave
};
