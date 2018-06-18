import atramentStory from './story';

class Episode {
  constructor(storyContent) {
    this.$episode = [];
    this.sceneId = -1;
    atramentStory.init(storyContent);
  }

  // public methods
  startEpisode() {
    this.resetEpisode();
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

  getEpisode() {
    return this.$episode;
  }

  resetEpisode() {
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
}

export default Episode;
