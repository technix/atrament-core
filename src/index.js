/* global window,fetch */
import 'whatwg-fetch';
import Vue from 'vue';
import Atrament from './atrament';
import AtramentUI from './ui/atrament.vue';

const atrament = new Atrament();
window.Atrament = atrament; // FIXME: global Atrament object for debugging purposes

Vue.prototype.$atrament = atrament;
const app = new Vue(AtramentUI).$mount('#atrament-app');

fetch('/example.ink.json')
    .then((content) => content.json())
    .then((json) => {
        atrament.initStory('intercept', json);
        app.story = atrament.startStory();
    });
