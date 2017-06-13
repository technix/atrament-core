/* global window */
import AtramentStory from './story';

class Atrament {
    constructor() {
        this.storage = window.localStorage;
    }

    initStory(gameId, storyContent) {
        this.$story = [];
        this.gameId = gameId;
        this.atramentStory = new AtramentStory(storyContent);
    }

    getStory() {
        return this.$story;
    }

    startStory() {
        this.$story = [];
        return this.updateStory();
    }

    continueStory(sceneId, choiceId) {
        this.$story[sceneId].isActive = false;
        this.choice(choiceId);
        return this.updateStory();
    }

    updateStory() {
        const scene = this.scene();
        scene.id = this.$story.length;
        scene.isActive = true;
        this.$story.push(scene);
        return this.$story;
    }

    resetStory() {
        this.$story = [];
    }

    scene() {
        return this.atramentStory.getScene();
    }

    choice(id) {
        this.atramentStory.makeChoice(id);
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
