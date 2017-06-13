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
        const gameState = {
            state: this.atramentStory.saveState(),
            story: this.$story
        };
        this.storage.setItem(this.gameId, JSON.stringify(gameState));
    }

    load() {
        const gameState = JSON.parse(this.storage.getItem(this.gameId));
        this.$story = gameState.story;
        this.atramentStory.loadState(gameState.state);
    }
}

export default Atrament;
