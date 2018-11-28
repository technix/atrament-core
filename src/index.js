import AtramentStory from './story';
import InkCommands from './ink/commands';
import InkObservers from './ink/observers';
import InkFunctions from './ink/functions';

function stub(id) {
  return new Promise(() => {
    throw new Error(`${id} is not implemented`);
  });
}

/*
  gameConfig: {
    storyFile: 'filename.ink.json',
    transcript: true
  }
*/

// atrament.story.getCurrentEpisode();
// atrament.story.getCurrentScene();
// atrament.story.getState();

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
    this.inkCommands = new InkCommands();
    this.story = {};
    this.transcript = [];
  }

  startGame() {
    // load first episode
    return this.loadStoryFile().then(() => {
      this.story.clearEpisode();
    });
  }

  loadGame(slotId) {
    let gameState = {};
    return this.dispatch('loadGame', slotId)
      .then((data) => {
        gameState = JSON.parse(data);
        return this.loadStoryFile();
      })
      .then(() => {
        this.story.restoreState(gameState);
      });
  }

  saveGame(slotId) {
    return this.dispatch(
      'saveGame',
      {
        id: slotId,
        data: this.story.getState()
      }
    );
  }

  // render scene
  renderScene() {
    const scene = this.story.renderScene(this.inkCommands);
    if (this.game.transcript) {
      this.transcript.push(scene);
    }
    return scene;
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
        this.story.ChooseChoiceIndex(choiceId); // eslint-disable-line new-cap
      } catch (error) {
        this.dispatch('error', error);
        reject(error);
      }
      resolve();
    });
  }

  loadStoryFile() {
    return this.dispatch('loadStory', this.game.storyFile).then((data) => {
      let storyContent = data;
      if (typeof data === 'string') {
        const outputFileContent = data.replace('\uFEFF', '');
        storyContent = JSON.parse(outputFileContent);
      }
      this.initEpisode(storyContent);
    });
  }

  initEpisode(storyContent) {
    // init story
    const story = new AtramentStory(storyContent);
    // register observers
    this.inkObservers.attach(story);
    // register functions
    this.inkFunctions.attach(story);
    // expose story
    this.story = story;
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
  registerCommand(cmd, callback) {
    this.inkCommands.register(cmd, callback);
  }

  debug() {
    return this.story.state;
  }
}

module.exports = Atrament;
