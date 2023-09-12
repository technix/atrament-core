const gameState = {};
let key = '';

function dbkey(id) {
  return `${key}${id}`;
}

function reset() {
  key = '';
  Object.keys(gameState).forEach((k) => delete gameState[k]);
}

function init(prefix) {
  key = `>>${prefix}<<`;
}

async function exists(id) {
  return !!gameState[dbkey(id)];
}

async function get(id) {
  return JSON.parse(gameState[dbkey(id)]);
}

async function set(id, state) {
  gameState[dbkey(id)] = JSON.stringify(state);
}

async function remove(id) {
  delete gameState[dbkey(id)];
}

async function keys() {
  return Object.keys(gameState).filter((k) => k.includes(key)).map((k) => k.replace(key, ''));
}

export default {
  gameState,
  reset,
  init,
  exists,
  get,
  set,
  remove,
  keys
};
