/* global window */
import Vue from 'vue';
import Atrament from './atrament';
import AtramentUI from './ui/atrament.vue';

const atrament = new Atrament('intercept');
window.Atrament = atrament;

Vue.prototype.$atrament = atrament;
const app = new Vue(AtramentUI);
app.$mount('#atrament-app');
