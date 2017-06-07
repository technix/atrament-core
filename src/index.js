/* global document,window */
import $ from 'jquery';
import Atrament from './atrament';
import UI from './theme/paper';

const atrament = new Atrament('intercept');
window.Atrament = atrament;

$(document).ready(() => {
    $.get('/intercept.ink.json').then((content) => {
        atrament.story = content;
        atrament.ui = UI;
        atrament.startGame();
    });
});
