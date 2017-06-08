/* global window */
import AtramentStory from './story';

class Atrament {
    constructor(gameId) {
        this.storage = window.localStorage;
        this.gameId = gameId;
    }

    set story(storyContent) {
        this.atramentStory = new AtramentStory(storyContent);
    }

    scene() {
        return this.atramentStory.getScene();
    }

    choice(id) {
        this.atramentStory.makeChoice(id);
    }

    continue() {
        return this.getScene();
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
