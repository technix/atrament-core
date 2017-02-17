var AtramentStory = require('./story.js');

var Atrament = {
    ui: null,
    story: null,
    init: function init(storyContent) {
        this.story = new AtramentStory(storyContent);
        return this;
    },
    setUI: function setUI(ui) {
        this.ui = ui;
        return this;
    },
    startGame: function startGame() {
        var self = this;

        function choiceCallback(id) {
            self.story.makeChoice(id);
            continueStory();
        }

        function continueStory() {
            var scene = self.story.getScene();
            self.ui.renderScene(scene);
        }

        self.ui.init(choiceCallback);
        continueStory();
    }
};

module.exports = Atrament;
