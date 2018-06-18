/* global window */
import Episode from './episode';

class Atrament {
  constructor(gameConfig, fileLoader) {
    this.storage = {};// window.localStorage;
    this.game = gameConfig;
    this.currentEpisode = {};
    this.fileLoader = fileLoader;
  }

  startGame() {
    // load first episode
    return this.startEpisode(this.game.episodes[0]);
  }

  getCurrentScene() {
    return this.currentEpisode.getCurrentScene();
  }

  makeChoice(choiceId) {
    return new Promise((resolve) => {
      this.currentEpisode.makeChoice(choiceId);
      resolve();
    });
  }

  startEpisode(filename) {
    return this.fileLoader(filename).then((data) => {
      const storyContent = JSON.parse(data);
      this.currentEpisode = new Episode(storyContent);
      this.currentEpisode.startEpisode();
      return filename;
    });
  }

/*

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
*/

}

module.exports = Atrament;
