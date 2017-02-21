/* global document */
import $ from 'jquery';
import Atrament from './atrament';
import UI from './theme/paper';

$(document).ready(() => {
    $.get('/intercept.ink.json').then((content) => {
        const atrament = new Atrament(content);
        atrament.ui = UI;
        atrament.startGame();
    });
});
