
var $ = require('jquery');

var atrament = require('./atrament');
var ui = require('./theme/paper');

$(document).ready(function start() {
    $.get('/intercept.ink.json').then(function done(content) {
        atrament.init(content).setUI(ui).startGame();
    });
});
