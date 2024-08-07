import ink from './ink';
import { interfaces } from '../utils/interfaces';
import { emit } from '../utils/emitter';

export const SAVE_GAME = 'game';
export const SAVE_AUTOSAVE = 'autosave';
export const SAVE_CHECKPOINT = 'checkpoint';

function savePrefix() {
  const { $gameUUID, $sessionID } = interfaces().state.get().game;
  return [
    $gameUUID,
    $sessionID || '',
    'save'
  ].join('/');
}


export function getSaveSlotKey({ name, type }) {
  return [
    savePrefix(),
    typeof type === 'string' ? type : '',
    typeof name === 'string' ? name : ''
  ].join('/');
}


export async function load(s) {
  let saveSlotKey = s;
  if (typeof s === 'object') {
    saveSlotKey = getSaveSlotKey(s);
  }
  const { persistent, state } = interfaces();
  const gameState = await persistent.get(saveSlotKey);
  state.setKey('scenes', gameState.scenes);
  state.setKey('game', gameState.game);
  ink.loadState(gameState.state);
  emit('game/load', saveSlotKey);
}


export async function save({ name, type }) {
  const { state, persistent } = interfaces();
  const atramentState = state.get();
  const gameState = {
    name,
    type,
    date: Date.now(),
    state: ink.getState(),
    game: atramentState.game,
    scenes: atramentState.scenes
  };
  const saveSlotKey = getSaveSlotKey({ name, type });
  await persistent.set(saveSlotKey, gameState);
  emit('game/save', saveSlotKey);
}


export async function existSave(saveSlotKey) {
  const saveExists = await interfaces().persistent.exists(saveSlotKey);
  return saveExists;
}


export async function removeSave(saveSlotKey) {
  await interfaces().persistent.remove(saveSlotKey);
  emit('game/removeSave', saveSlotKey);
}


export async function listSaves() {
  const { persistent } = interfaces();
  const keys = await persistent.keys();
  const saves = keys.filter((k) => k.includes(savePrefix()));
  const savesList = await Promise.all(
    saves.map(
      async (key) => {
        const saveData = await persistent.get(key);
        saveData.id = key;
        delete saveData.state;
        delete saveData.scenes;
        return saveData;
      }
    )
  );
  emit('game/listSaves', savesList);
  return savesList;
}
