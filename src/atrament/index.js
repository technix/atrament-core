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
        this.atramentStory.makeChoice(choiceId);
        return this.updateStory();
    }

    updateStory() {
        const scene = this.nextScene();
        this.$story.push(scene);
        return this.$story;
    }

    nextScene() {
        const scene = this.atramentStory.getScene();
        scene.id = this.$story.length;
        scene.isActive = true;
        return scene;
    }

    resetStory() {
        this.$story = [];
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
