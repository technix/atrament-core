import Episode from './episode';
import Command from './command';

function stub(id) {
  return new Promise(() => {
    throw new Error(`${id} is not implemented`);
  });
}

class Atrament {
  constructor(gameConfig) {
    this.game = gameConfig;
    this.events = {
      loadStory: () => stub('loadStory'),
      loadGame: () => stub('loadGame'),
      saveGame: () => stub('saveGame'),
      error: () => stub('error')
    };
    this.inkFunctions = {};
    this.inkObservers = {};
    this.inkCommands = {};
    this.episode = {};
    this.command = {};
  }

  startGame() {
    // load first episode
    return this.loadEpisode(this.game.episodes[0]).then(() => {
      this.episode.reset();
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
        this.episode.restoreState(gameState.episode);
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

  // render scene
  renderScene() {
    return this.episode.renderScene(this.command);
  }

  getCurrentEpisode() {
    return this.episode.content;
  }

  // get current scene, rendered by renderScene
  getCurrentScene() {
    return this.episode.getCurrentScene();
  }

  makeChoice(choiceId) {
    return new Promise((resolve, reject) => {
      try {
        this.episode.makeChoice(choiceId);
      } catch (error) {
        this.dispatch('error', error);
        reject(error);
      }
      resolve();
    });
  }

  loadEpisode(filename) {
    return this.dispatch('loadStory', filename).then((data) => {
      const storyContent = JSON.parse(data);
      // init episode
      const episode = new Episode(filename, storyContent);
      // register ink functions and observers for new episode
      episode.registerFunctions(this.inkFunctions);
      episode.registerObservers(this.inkObservers);
      this.episode = episode;
      // register commands with correct dependencies
      this.command = new Command({episode: this.episode, story: this.episode.story});
      Object.keys(this.inkCommands).forEach((cmd) => {
        const cmdObj = this.inkCommands[cmd];
        this.command.register(cmd, cmdObj.callback, cmdObj.deps);
      });
    });
  }

  getGameState() {
    return {
      episode: this.episode.getState()
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

  // register Ink commands
  registerCommand(cmd, callback, deps) {
    this.inkCommands[cmd] = {callback, deps};
  }

  debug() {
    return this.episode.story.state;
  }
}

module.exports = Atrament;
