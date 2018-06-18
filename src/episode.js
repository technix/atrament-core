import atramentStory from './story';

class Episode {
  constructor(filename, storyContent) {
    this.id = filename;
    this.$episode = [];
    this.sceneId = -1;
    atramentStory.init(storyContent);
  }

  // public methods
  start() {
    this.reset();
    this.nextScene();
  }

  getCurrentScene() {
    return this.$episode[this.$episode.length - 1];
  }

  makeChoice(choiceId) {
    atramentStory.makeChoice(choiceId);
    this.nextScene();
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

  nextScene() {
    // deactivate previous scene
    if (this.sceneId >= 0) {
      this.$episode[this.sceneId].isActive = false;
    }
    this.sceneId += 1;
    // get new scene
    const scene = atramentStory.getScene();
    scene.isActive = true;
    scene.id = this.sceneId;
    this.$episode.push(scene);
  }

  // get state snapshot
  getState() {
    return {
      filename: this.id,
      episode: this.$episode,
      story: JSON.parse(atramentStory.saveState())
    };
  }
}

export default Episode;
