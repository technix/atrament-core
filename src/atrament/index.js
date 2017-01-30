var inkjs = require('inkjs/dist/ink.js');

function AtramentStory(storyContent) {
    this.story = new inkjs.Story(storyContent);
    return this;
}
AtramentStory.prototype.getScene = function getScene() {
    var scene = {
        text: [],
        choices: []
    };
    while (this.story.canContinue) {
        scene.text.push(this.story.Continue()); // eslint-disable-line new-cap
    }
    this.story.currentChoices.forEach(function choiceFn(choice, index) {
        scene.choices.push({id: index, text: choice.text});
    });
    return scene;
};
AtramentStory.prototype.makeChoice = function makeChoice(id) {
    this.story.ChooseChoiceIndex(id); // eslint-disable-line new-cap
};


var Atrament = {
    init: function init(storyContent) {
        return new AtramentStory(storyContent);
    }
};

module.exports = Atrament;
