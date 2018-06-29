import episode from './episode';

function stub(id) {
  return new Promise(() => {
    throw new Error(`${id} is not implemented`);
  });
}

let game;
let events;
let inkFunctions;
let inkObservers;

const Atrament = {
  init(gameConfig) {
    game = gameConfig;
    events = {
      loadStory: () => stub('loadStory'),
      loadGame: () => stub('loadGame'),
      saveGame: () => stub('saveGame'),
      error: () => stub('error')
    };
    inkFunctions = {};
    inkObservers = {};
  },

  startGame() {
    // load first episode
    return this.loadEpisode(game.episodes[0]).then(() => {
      episode.reset();
    });
  },

  loadGame(slotId) {
    let gameState = {};
    return this.dispatch('loadGame', slotId)
      .then((data) => {
        gameState = JSON.parse(data);
        return this.loadEpisode(gameState.episode.filename);
      })
      .then(() => {
        episode.restoreState(gameState.episode);
      });
  },

  saveGame(slotId) {
    return this.dispatch(
      'saveGame',
      {
        id: slotId,
        data: this.getGameState()
      }
    );
  },

  // render scene
  renderScene() {
    return episode.renderScene();
  },

  // get current scene, rendered by renderScene
  getCurrentScene() {
    return episode.getCurrentScene();
  },

  makeChoice(choiceId) {
    return new Promise((resolve, reject) => {
      try {
        episode.makeChoice(choiceId);
      } catch (error) {
        this.dispatch('error', error);
        reject(error);
      }
      resolve();
    });
  },

  loadEpisode(filename) {
    return this.dispatch('loadStory', filename).then((data) => {
      const storyContent = JSON.parse(data);
      episode.init(filename, storyContent);
      // register ink functions and observers for new episode
      episode.registerFunctions(inkFunctions);
      episode.registerObservers(inkObservers);
    });
  },

  getGameState() {
    return {
      episode: episode.getState()
    };
  },

  // register event handler
  on(eventName, eventHandler) {
    events[eventName] = eventHandler;
  },

  // dispatch event
  dispatch(eventName, eventParams) {
    return events[eventName](eventParams);
  },

  // register functions for ink story
  registerFunctions(fnList) {
    Object.keys(fnList).forEach((fn) => {
      inkFunctions[fn] = fnList[fn];
    });
  },

  // register observers for ink story variables
  registerObservers(obList) {
    Object.keys(obList).forEach((ob) => {
      inkObservers[ob] = obList[ob];
    });
  },

  debug() {
    return episode.story.state;
  }
};

module.exports = Atrament;
