/* global window */
import AtramentStory from './story';

class Atrament {
    constructor(gameId) {
        this.storage = window.localStorage;
        this.gameId = gameId;
    }

    set ui(uiObj) {
        this.UI = uiObj;
    }

    set story(storyContent) {
        this.atramentStory = new AtramentStory(storyContent);
    }

    startGame() {
        this.UI.init(this.choiceCallback.bind(this));
        this.continueStory();
    }

    choiceCallback(id) {
        this.atramentStory.makeChoice(id);
        this.continueStory();
    }

    continueStory() {
        const scene = this.atramentStory.getScene();
        this.UI.renderScene(scene);
    }

    save() {
        const state = this.atramentStory.saveState();
        this.storage.setItem(this.gameId, JSON.stringify(state));
    }

    load() {
        const state = JSON.parse(this.storage.getItem(this.gameId));
        this.atramentStory.loadState(state);
        this.continueStory();
    }
}

export default Atrament;
