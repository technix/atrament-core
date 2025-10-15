// simple in-memory app state

const atramentState = {
  settings: {},
  game: {},
  metadata: {},
  scenes: [],
  vars: {}
};

function reset() {
  atramentState.settings = {};
  atramentState.game = {};
  atramentState.metadata = {};
  atramentState.scenes = [];
  atramentState.vars = {};
}

function store() {
  return atramentState;
}

function get() {
  return JSON.parse(JSON.stringify(atramentState));
}

function setKey(name, value) {
  atramentState[name] = value;
}

function toggleKey(name) {
  atramentState[name] = !atramentState[name];
}

function appendKey(name, value) {
  atramentState[name] = [...atramentState[name], value];
}

function setSubkey(name, subname, value) {
  atramentState[name] = { ...atramentState[name], [subname]: value };
}

function toggleSubkey(name, subname) {
  atramentState[name] = { ...atramentState[name], [subname]: !atramentState[name][subname] };
}

function appendSubkey(name, subname, value) {
  atramentState[name] = { ...atramentState[name], [subname]: [...atramentState[name][subname], value] };
}

export default {
  reset,
  store,
  get,
  setKey,
  toggleKey,
  appendKey,
  setSubkey,
  toggleSubkey,
  appendSubkey
};
