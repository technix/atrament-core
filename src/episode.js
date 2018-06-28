import atramentStory from './story';

class Episode {
  constructor(filename, storyContent) {
    this.id = filename;
    this.$episode = [];
    this.sceneId = -1;
    atramentStory.init(storyContent);
  }

  // register ink variable observers
  registerObservers(inkObservers) {
    Object.keys(inkObservers).forEach((ob) => {
      atramentStory.observeVar(ob, inkObservers[ob]);
    });
  }

  // register ink functions
  registerFunctions(inkFunctions) {
    Object.keys(inkFunctions).forEach((fn) => {
      atramentStory.bindFunction(fn, inkFunctions[fn]);
    });
  }

  // public methods
  start() {
    this.reset();
  }

  renderScene() {
    const scene = atramentStory.getScene();
    return this.updateEpisode(scene);
  }

  getCurrentScene() {
    return this.$episode[this.$episode.length - 1];
  }

  makeChoice(choiceId) {
    atramentStory.makeChoice(choiceId);
  }

  // internal methods

  // eslint-disable-next-line class-methods-use-this
  getStory() {
    return atramentStory;
  }

  getEpisode() {
    return this.$episode;
  }

  reset() {
    this.$episode.splice(0);
  }

  updateEpisode(scene) {
    // deactivate previous scene
    if (this.sceneId >= 0) {
      this.$episode[this.sceneId].isActive = false;
    }
    this.sceneId += 1;
    // append new scene
    scene.isActive = true;
    scene.id = this.sceneId;
    this.$episode.push(scene);
    return scene;
  }

  // get state snapshot
  getState() {
    return {
      filename: this.id,
      episode: this.$episode,
      story: JSON.parse(atramentStory.saveState())
    };
  }

  // restore
  restoreState(state) {
    this.id = state.filename;
    this.$episode = state.episode;
    atramentStory.loadState(JSON.stringify(state.story));
  }
}

export default Episode;
