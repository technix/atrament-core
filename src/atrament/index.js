import AtramentStory from './story';

class Atrament {
    constructor(storyContent) {
        this.atramentStory = new AtramentStory(storyContent);
    }

    set ui(uiObj) {
        this.UI = uiObj;
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

}

export default Atrament;
