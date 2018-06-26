import Episode from './episode';

function stub(id) {
  return new Promise(() => {
    throw new Error(`${id} is not implemented`);
  });
}

class Atrament {
  constructor(gameConfig) {
    this.game = gameConfig;
    this.currentEpisode = {};
    this.events = {
      loadStory: () => stub('loadStory'),
      loadGame: () => stub('loadGame'),
      saveGame: () => stub('saveGame')
    };
    this.inkFunctions = {};
    this.inkObservers = {};
  }

  startGame() {
    // load first episode
    return this.loadEpisode(this.game.episodes[0]).then(() => {
      this.currentEpisode.start();
    });
  }

  loadGame(slotId) {
    let gameState = {};
    return this.dispatch('loadGame', slotId)
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
    return this.dispatch('loadStory', filename).then((data) => {
      const storyContent = JSON.parse(data);
      this.currentEpisode = new Episode(filename, storyContent, this.inkFunctions, this.inkObservers);
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

  // register functions for ink story
  registerFunctions(fnList) {
    Object.keys(fnList).forEach((fn) => {
      this.inkFunctions[fn] = fnList[fn];
    });
  }

  // register observers for ink story variables
  registerObservers(obList) {
    Object.keys(obList).forEach((ob) => {
      this.inkObservers[ob] = obList[ob];
    });
  }
}

module.exports = Atrament;
