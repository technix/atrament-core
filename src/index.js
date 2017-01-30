var $ = require('jquery');
var inkjs = require('inkjs/dist/ink.js');

function getScene(story) {
    var scene = {
        text: [],
        choices: []
    };
    while (story.canContinue) {
        scene.text.push(story.Continue());
    }
    story.currentChoices.forEach(function choiceFn(choice, index) {
        scene.choices.push({id: index, text: choice.text});
    });
    return scene;
}

$(document).ready(function start() {
    $('body').append('<div id="text"></div><div id="choices"></div>');

    var story = new inkjs.Story(storyContent);

    function continueStory() {
        var scene = getScene(story);
        
        var storytext = $();
        scene.text.forEach(function renderText(paragraph) {
            storytext = storytext.add($('<p>').html(paragraph));
        });
        $('#text').append(storytext);

        var choices = $();
        scene.choices.forEach(function renderChoice(choice) {
            choices = choices.add(
                $('<p>').html('<a href="#" class="choice" data-id="' +  choice.id + '">' + choice.text + '</a>')
            );
        });
        $('#choices').append(choices);
    }

    $('#choices').on('click', 'a', function choiceSelected(e) {
        e.preventDefault();
        $('#choices').html('');
        story.ChooseChoiceIndex($(this).attr('data-id'));
        continueStory();
    });

    continueStory();
});
