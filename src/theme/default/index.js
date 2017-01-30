// default UI
var $ = require('jquery');

var UI = {
    init: function init(choiceCallback) {
        $('body').append('<div id="text"></div><div id="choices"></div>');
        $('#choices').on('click', 'a', function choiceSelected(e) {
            e.preventDefault();
            $('#choices').html('');
            var id = $(this).attr('data-id');
            choiceCallback(id);
        });
    },
    renderScene: function renderScene(scene) {
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
};

module.exports = UI;
