<template>
    <div class="atrament-scroll">
        <div class="atrament-container"></div>
    </div>
</template>

<script>
/* global fetch */
import 'whatwg-fetch';
import Atrament from '../atrament';
import Story from './story.vue';

const atrament = new Atrament('intercept');
this.Atrament = atrament;

function choiceCallback(id) {
    atrament.choice(id);
    return atrament.scene();
}

export default {
    data() {
        return {
            scene: {},
            choiceCallback
        };
    },
    components: {
        'story-component': Story
    },
    beforeMount() {
        fetch('/intercept.ink.json').then(
            (content) => {
                atrament.story = content;
                this.scene = atrament.scene();
            }
        );
    }
};

</script>

<style>
.atrament-scroll {
    width: 200px;
    height: 400px;
    border: 1px solid #000000;
    overflow-y: hidden;
}

.atrament-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    position: relative;
}
</style>
