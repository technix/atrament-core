// default UI
require('./style.css');
var $ = require('jquery');

var config = {
    scrollMode: 'alwaysTop' // alwaysBottom
};

var UI = {
    init: function init(choiceCallback) {
        $('#atrament-container').append('<div id="text-container"></div>');
        $('#atrament-container').append('<div id="choice-container"></div>');
        $('#choice-container').on('click', 'a', function choiceSelected(e) {
            e.preventDefault();
            $('#choice-container').html('');
            var id = $(this).attr('data-id');
            choiceCallback(id);
        });
    },
    renderScene: function renderScene(scene) {
        var storytext = $('<div class="text-wrapper">');
        scene.text.forEach(function renderText(paragraph) {
            storytext = storytext.append($('<p>').html(paragraph));
        });
        $('#text-container').append(storytext);

        var choices = $();
        scene.choices.forEach(function renderChoice(choice) {
            choices = choices.add(
                $('<div class="choice-wrapper">').html(
                    '<a href="#" class="choice" data-id="' +  choice.id + '">' + choice.text + '</a>'
                )
            );
        });
        $('#choice-container').append(choices);
        var scrollHeight = (config.scrollMode === 'alwaysBottom') ?
            $('#atrament-container').prop('scrollHeight') :
            storytext.prop('offsetTop');
        $('#atrament-container').animate({scrollTop: scrollHeight}, 1000);
    }
};

module.exports = UI;
