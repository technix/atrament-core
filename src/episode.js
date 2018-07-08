import AtramentStory from './story';

class Episode {
  constructor(episodeId, storyContent) {
    this.id = episodeId;
    this.$episode = [];
    this.$story = new AtramentStory(storyContent);
    this.sceneId = -1;
  }

  reset() {
    this.$episode.splice(0);
    this.sceneId = -1;
  }

  // register ink variable observers
  registerObservers(inkObservers) {
    Object.keys(inkObservers).forEach((ob) => {
      this.$story.observeVar(ob, inkObservers[ob]);
    });
  }

  // register ink functions
  registerFunctions(inkFunctions) {
    Object.keys(inkFunctions).forEach((fn) => {
      this.$story.bindFunction(fn, inkFunctions[fn]);
    });
  }

  renderScene(cmdInstance) {
    const scene = this.$story.getScene(cmdInstance);
    return this.updateEpisode(scene);
  }

  getCurrentScene() {
    return this.$episode[this.$episode.length - 1];
  }

  makeChoice(choiceId) {
    this.$story.makeChoice(choiceId);
  }

  // getters

  get story() {
    return this.$story;
  }

  get content() {
    return this.$episode;
  }

  // internal methods

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
      story: JSON.parse(this.$story.saveState())
    };
  }

  // restore
  restoreState(state) {
    this.id = state.filename;
    this.$episode = state.episode;
    this.$story.loadState(JSON.stringify(state.story));
  }
}

export default Episode;
