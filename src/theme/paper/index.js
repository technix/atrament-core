// default UI
import $ from 'jquery';
import '../paper/style.css';

const config = {
    scrollMode: 'alwaysTop' // alwaysBottom
};

const UI = {
    init: function init(choiceCallback) {
        $('#atrament-container').append('<div id="text-container"><div id="text-stub"></div></div>');
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
        // var sLen = scene.choices.length - 1;
        scene.choices.forEach((choice) => {
            choices = choices.add(
                $('<div>')
                // .css('background-position-x', ((sLen - index) * 5) + 'px')
                .addClass('choice-wrapper')
                .html(`<a href="#" class="choice" data-id="${choice.id}">${choice.text}</a>`)
            );
        });
        $('#choice-container').append(choices);
        const scrollH = $('#atrament-container').prop('scrollHeight');
        const offsetTop = storytext.prop('offsetTop');
        const scrollHeight = (config.scrollMode === 'alwaysBottom') ?
            scrollH :
            offsetTop;
        $('#atrament-container').animate({scrollTop: scrollHeight}, 1500 - (scrollH - offsetTop));
    }
};

export default UI;
