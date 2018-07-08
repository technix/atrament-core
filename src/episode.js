import AtramentStory from './story';

class Episode {
  constructor(episodeId, storyContent, inkObservers, inkFunctions) {
    this.id = episodeId;
    this.$episode = [];
    this.$story = new AtramentStory(storyContent);
    this.sceneId = -1;
    inkObservers.attach(this.$story);
    inkFunctions.attach(this.$story);
  }

  reset() {
    this.$episode.splice(0);
    this.sceneId = -1;
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
