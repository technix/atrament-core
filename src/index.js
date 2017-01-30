
var $ = require('jquery');

var atrament = require('./atrament');
var ui = require('./theme/default');

function startGame(storyContent) {
    var story = atrament.init(storyContent);

    function choiceCallback(id) {
        story.makeChoice(id);
        continueStory();
    }

    function continueStory() {
        var scene = story.getScene();
        ui.renderScene(scene);
    }

    ui.init(choiceCallback);
    continueStory();
}

$(document).ready(function start() {
    $.get('/example.ink.json').then(function done(content) {
        startGame(content);
    });
});
