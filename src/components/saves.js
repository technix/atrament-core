import ink from './ink';
import { playMusic } from './sound';
import { interfaces } from '../utils/interfaces';
import { emit } from '../utils/emitter';


export function $getSlotName(id) {
  const { gameUUID } = interfaces().state.get().game;
  let saveId = id;
  if (!id) {
    saveId = '_autosave_';
  }
  return `${gameUUID}/${saveId}`;
}


export async function load(saveID) {
  emit('game/load', saveID);
  const { persistent, state } = interfaces();
  const gameState = await persistent.get($getSlotName(saveID));
  state.setKey('scenes', gameState.scenes);
  state.setKey('game', gameState.game);
  ink.loadState(gameState.state);
  // restore observed variables
  const { metadata, game } = state.get();
  // TODO: avoid double restoring of observed variables on load and on start
  if (metadata.observe) {
    metadata.observe.forEach((name) => {
      state.setSubkey('vars', name, ink.getVariable(name));
    });
  }
  // restore music
  if (game.$currentMusic) {
    playMusic(game.$currentMusic);
  }
}


export async function save(saveID) {
  emit('game/save', saveID);
  const { state, persistent } = interfaces();
  const atramentState = state.get();
  const gameState = {
    id: saveID,
    date: Date.now(),
    state: ink.getState(),
    game: atramentState.game,
    scenes: atramentState.scenes
  };
  await persistent.set($getSlotName(saveID), gameState);
}


export async function existSave(saveID) {
  const saveExists = await interfaces().persistent.exists($getSlotName(saveID));
  return saveExists;
}


export async function removeSave(saveID) {
  emit('game/removeSave', saveID);
  await interfaces().persistent.remove($getSlotName(saveID));
}


export async function listSaves() {
  const { state, persistent } = interfaces();
  const { gameUUID } = state.get().game;
  const keys = await persistent.keys();
  const saves = keys.filter((k) => k.includes(gameUUID));
  const savesList = await Promise.all(
    saves.map(
      async (saveID) => {
        const { id, date, game } = await persistent.get(saveID);
        return { id, date, game };
      }
    )
  );
  emit('game/listSaves', savesList);
  return savesList;
}
