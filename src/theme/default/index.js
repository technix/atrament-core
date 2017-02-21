// default UI
import $ from 'jquery';
import './style.css';

const config = {
    scrollMode: 'alwaysTop' // alwaysBottom
};

const UI = {
    init: function init(choiceCallback) {
        $('#atrament-container').append('<div id="text-container"></div>');
        $('#atrament-container').append('<div id="choice-container"></div>');
        $('#choice-container').on('click', 'a', function choiceSelected(e) {
            e.preventDefault();
            $('#choice-container').html('');
            const id = $(this).attr('data-id');
            choiceCallback(id);
        });
    },
    renderScene: function renderScene(scene) {
        let storytext = $('<div class="text-wrapper">');
        scene.text.forEach((paragraph) => {
            storytext = storytext.append($('<p>').html(paragraph));
        });
        $('#text-container').append(storytext);

        let choices = $();
        scene.choices.forEach((choice) => {
            choices = choices.add(
                $('<div')
                .addClass('choice-wrapper')
                .html(`<a href="#" class="choice" data-id="${choice.id}">${choice.text}</a>`)
            );
        });
        $('#choice-container').append(choices);
        const scrollHeight = (config.scrollMode === 'alwaysBottom') ?
            $('#atrament-container').prop('scrollHeight') :
            storytext.prop('offsetTop');
        $('#atrament-container').animate({scrollTop: scrollHeight}, 1000);
    }
};

export default UI;
