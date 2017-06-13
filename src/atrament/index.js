/* global window */
import AtramentStory from './story';

class Atrament {
    constructor(gameId) {
        this.storage = window.localStorage;
        this.gameId = gameId;
        this.sceneId = 0;
        this.$story = [];
    }

    set story(storyContent) {
        this.atramentStory = new AtramentStory(storyContent);
    }

    getStory() {
        return this.$story;
    }

    startStory() {
        this.$story = [];
        return this.updateStory();
    }

    continueStory(choiceId) {
        this.choice(choiceId);
        return this.updateStory();
    }

    updateStory() {
        this.sceneId += 1;
        const scene = this.scene();
        scene.id = this.sceneId;
        scene.isActive = true;
        this.$story.push(scene);
        return this.$story;
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
