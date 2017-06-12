import Vue from 'vue';
import AtramentUI from './ui/atrament.vue';

const app = new Vue({
    el: '#atrament-app',
    components: {
        atrament: AtramentUI
    }
});
