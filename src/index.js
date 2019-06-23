import AtramentStory from './story';
import InkCommands from './commands';
import PubSub from './pubsub';

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
    this.event = new PubSub();
    this.event.subscribeAll({
      loadStory: () => stub('loadStory'),
      loadGame: () => stub('loadGame'),
      saveGame: () => stub('saveGame'),
      error: () => stub('error')
    });
    this.inkObservers = new PubSub();
    this.inkFunctions = new PubSub();
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
    return this.event.publish('loadGame', slotId)
      .then((data) => {
        gameState = JSON.parse(data);
        return this.loadStoryFile();
      })
      .then(() => {
        this.story.restoreState(gameState.data);
      });
  }

  saveGame(slotId) {
    return this.event.publish(
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
    return new Promise((resolve) => {
      if (this.game.transcript) {
        this.transcript[this.transcript.length - 1].chosen = choiceId;
      }
      this.story.ChooseChoiceIndex(choiceId); // eslint-disable-line new-cap
      resolve();
    }).catch((error) => {
      this.event.publish('error', error);
    });
  }

  loadStoryFile() {
    return this.event.publish('loadStory', this.game.storyFile).then((data) => {
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
    this.inkObservers.apply(([v, cb]) => {
      story.ObserveVariable(v, cb);
    });
    // register functions
    this.inkFunctions.apply(([name, fn]) => {
      story.BindExternalFunction(name, fn);
    });
    // expose story
    this.story = story;
  }

  // register functions for ink story
  registerFunctions(fnList) {
    this.inkFunctions.subscribeAll(fnList);
  }

  // register observers for ink story variables
  registerObservers(obList) {
    this.inkObservers.subscribeAll(obList);
  }

  // register Ink commands
  registerCommand(cmd, callback) {
    this.inkCommands.register(cmd, callback);
  }

  // register Atrament event handler
  on(event, handler) {
    this.event.subscribe(event, handler);
  }

  debug() {
    return this.story.state;
  }
}

export default Atrament;
