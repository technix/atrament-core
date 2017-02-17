// default UI
require('../paper/style.css');
var $ = require('jquery');

var config = {
    scrollMode: 'alwaysTop' // alwaysBottom
};

var UI = {
    init: function init(choiceCallback) {
        $('#atrament-container').append('<div id="text-container"><div id="text-stub"></div></div>');
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
        // var sLen = scene.choices.length - 1;
        scene.choices.forEach(function renderChoice(choice) {
            choices = choices.add(
                $('<div>')
                // .css('background-position-x', ((sLen - index) * 5) + 'px')
                .addClass('choice-wrapper')
                .html(
                    '<a href="#" class="choice" data-id="' +  choice.id + '">' + choice.text + '</a>'
                )
            );
        });
        $('#choice-container').append(choices);
        var scrollH = $('#atrament-container').prop('scrollHeight');
        var offsetTop = storytext.prop('offsetTop');
        var scrollHeight = (config.scrollMode === 'alwaysBottom') ?
            scrollH :
            offsetTop;
        $('#atrament-container').animate({scrollTop: scrollHeight}, 1500 - (scrollH - offsetTop));
    }
};

module.exports = UI;
