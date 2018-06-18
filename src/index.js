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
    return this.loadEpisode(this.game.episodes[0]).then(() => {
      this.currentEpisode.start();
    });
  }

  loadGame(slotId) {
    let gameState = {};
    return this.saveLoader(slotId)
      .then((data) => {
        gameState = JSON.parse(data);
        return this.loadEpisode(gameState.episode.filename);
      })
      .then(() => {
        this.currentEpisode.restoreState(gameState.episode);
      });
  }

  saveGame(slotId) {
    return this.dispatch(
      'saveGame',
      {
        id: slotId,
        data: this.getGameState()
      }
    );
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

  loadEpisode(filename) {
    return this.storyLoader(filename).then((data) => {
      const storyContent = JSON.parse(data);
      this.currentEpisode = new Episode(filename, storyContent);
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
    return this.events[eventName](eventParams);
  }
}

module.exports = Atrament;
