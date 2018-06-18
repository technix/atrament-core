import Episode from './episode';

function stub(id) {
  return new Promise((resolve) => {
    console.warn(`${id} is not implemented`);
    resolve(false);
  });
}

class Atrament {
  constructor(gameConfig, storyLoader, saveLoader) {
    this.game = gameConfig;
    this.currentEpisode = {};
    this.storyLoader = storyLoader;
    this.saveLoader = saveLoader;
    this.events = {
      saveGame: () => stub('saveGame'),
      loadGame: () => stub('loadGame')
    };
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
    return this.storyLoader(filename).then((data) => {
      const storyContent = JSON.parse(data);
      this.currentEpisode = new Episode(filename, storyContent);
      this.currentEpisode.startEpisode();
      return filename;
    });
  }

  getGameState() {
    return {
      episode: this.currentEpisode.getState()
    };
  }

  // register event handler
  on(eventName, eventHandler) {
    this.events[eventName] = eventHandler;
  }

  // dispatch event
  dispatch(eventName, eventParams) {
    let params = eventParams;
    if (eventName === 'saveGame') {
      // pass game state
      params = this.getGameState();
    }
    return this.events[eventName](params);
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
