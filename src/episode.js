import atramentStory from './story';

let id;
let $episode;
let sceneId;

const Episode = {
  init(episodeId, storyContent) {
    id = episodeId;
    $episode = [];
    sceneId = -1;
    atramentStory.init(storyContent);
  },

  reset() {
    $episode.splice(0);
    sceneId = -1;
  },

  // register ink variable observers
  registerObservers(inkObservers) {
    Object.keys(inkObservers).forEach((ob) => {
      atramentStory.observeVar(ob, inkObservers[ob]);
    });
  },

  // register ink functions
  registerFunctions(inkFunctions) {
    Object.keys(inkFunctions).forEach((fn) => {
      atramentStory.bindFunction(fn, inkFunctions[fn]);
    });
  },

  renderScene(cmdRunner) {
    const scene = atramentStory.getScene(cmdRunner);
    return this.updateEpisode(scene);
  },

  getCurrentScene() {
    return $episode[$episode.length - 1];
  },

  makeChoice(choiceId) {
    atramentStory.makeChoice(choiceId);
  },

  // getters

  get story() {
    return atramentStory;
  },

  get content() {
    return $episode;
  },

  // internal methods

  updateEpisode(scene) {
    // deactivate previous scene
    if (sceneId >= 0) {
      $episode[sceneId].isActive = false;
    }
    sceneId += 1;
    // append new scene
    scene.isActive = true;
    scene.id = sceneId;
    $episode.push(scene);
    return scene;
  },

  // get state snapshot
  getState() {
    return {
      filename: id,
      episode: $episode,
      story: JSON.parse(atramentStory.saveState())
    };
  },

  // restore
  restoreState(state) {
    id = state.filename;
    $episode = state.episode;
    atramentStory.loadState(JSON.stringify(state.story));
  }
};

export default Episode;
