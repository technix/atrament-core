/* global window */
import atramentStory from './story';

class Atrament {
  constructor() {
    this.storage = {};// window.localStorage;
    this.sceneId = 0;
  }

  initStory(gameId, storyContent) {
    this.$story = [];
    this.gameId = gameId;
    atramentStory.init(storyContent);
  }

  getStory() {
    return this.$story;
  }

  startStory() {
    this.$story.splice(0);
    return this.updateStory();
  }

  continueStory(sceneId, choiceId) {
    this.$story.forEach((item) => {
      if (item.id === sceneId) {
        item.isActive = false;
        if (item.type !== 'text') {
          this.resetStory();
        }
      }
    });
    atramentStory.makeChoice(choiceId);
    return this.updateStory();
  }

  updateStory() {
    const scene = this.nextScene();
    if (scene.type !== 'text') {
      this.resetStory();
    }
    this.$story.push(scene);
    return this.$story;
  }

  nextScene() {
    const scene = atramentStory.getScene();
    scene.id = this.sceneId;
    this.sceneId += 1;
    scene.isActive = true;
    // console.log(scene);
    return scene;
  }

  resetStory() {
    this.$story.splice(0);
  }

  save() {
    const gameState = {
      state: atramentStory.saveState(),
      story: this.$story
    };
    this.storage.setItem(this.gameId, JSON.stringify(gameState));
  }

  load() {
    const gameState = JSON.parse(this.storage.getItem(this.gameId));
    this.$story = gameState.story;
    atramentStory.loadState(gameState.state);
  }
}

module.exports = Atrament;
