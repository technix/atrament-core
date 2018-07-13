import Episode from './episode';
import Command from './command';
import InkObservers from './ink/observers';
import InkFunctions from './ink/functions';

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
    this.inkObservers = new InkObservers();
    this.inkFunctions = new InkFunctions();
    this.inkCommands = {};
    this.episode = {};
    this.command = {};
    this.transcript = [];
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
    const scene = this.episode.renderScene(this.command);
    if (this.game.transcript) {
      this.transcript.push(scene);
    }
    return scene;
  }

  getCurrentEpisode() {
    return this.episode.content;
  }

  // get current scene, rendered by renderScene
  getCurrentScene() {
    return this.episode.getCurrentScene();
  }

  getTranscript() {
    return this.transcript;
  }

  makeChoice(choiceId) {
    return new Promise((resolve, reject) => {
      try {
        if (this.game.transcript) {
          this.transcript[this.transcript.length - 1].chosen = choiceId;
        }
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
      this.initEpisode(filename, storyContent);
    });
  }

  initEpisode(filename, storyContent) {
    // init episode
    const episode = new Episode(filename, storyContent, this.inkObservers, this.inkFunctions);
    this.episode = episode;
    // register commands with correct dependencies
    this.command = new Command({episode: this.episode, story: this.episode.story});
    Object.keys(this.inkCommands).forEach((cmd) => {
      const cmdObj = this.inkCommands[cmd];
      this.command.register(cmd, cmdObj.callback, cmdObj.deps);
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
    this.inkFunctions.register(fnList);
  }

  // register observers for ink story variables
  registerObservers(obList) {
    this.inkObservers.register(obList);
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
