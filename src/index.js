/* global document,window */
import $ from 'jquery';
import Atrament from './atrament';
import UI from './theme/paper';

const atrament = new Atrament('intercept');
window.Atrament = atrament;

function choiceCallback(id) {
    atrament.choice(id);
    return atrament.scene();
}

$(document).ready(() => {
    $.get('/intercept.ink.json').then((content) => {
        UI.init(choiceCallback);
        atrament.story = content;
        UI.renderScene(atrament.scene());
    });
});
