<template>
    <div class="atrament-scroll">
        <div class="atrament-container">
            <story-component :story="story"></story-component>
        </div>
    </div>
</template>

<script>
/* global fetch */
import 'whatwg-fetch';
import Story from './story.vue';

export default {
    data() {
        return {
            story: []
        };
    },
    components: {
        'story-component': Story
    },
    beforeMount() {
        fetch('/intercept.ink.json')
            .then((content) => content.json())
            .then((json) => {
                this.$atrament.story = json;
                this.story = this.$atrament.startStory();
            });
    },
    watch: {
        story: function story() {
            return this.$atrament.getStory();
        }
    }
};
</script>

<style>
::-webkit-scrollbar {
    display: none;
}

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
