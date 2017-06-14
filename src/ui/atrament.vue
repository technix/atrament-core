<template>
<div class="wrapper">
    <div class="atrament-scroll">
        <div class="atrament-container">
            <story-component :story="story"></story-component>
        </div>
    </div>
<button v-on:click="saveGame">Save</button>
<button v-on:click="loadGame">Load</button>
</div>
</template>

<script>
import Story from './story.vue';

export default {
    props: ['story'],
    components: {
        'story-component': Story
    },
    methods: {
        saveGame() {
            this.$atrament.save();
            console.log('game is saved');
        },
        loadGame() {
            this.$atrament.load();
            this.story = this.$atrament.getStory();
            console.log('game is loaded');
        }
    }
};
</script>

<style>
::-webkit-scrollbar {
    display: none;
}

.atrament-scroll {
    width: 360px;
    height: 600px;
    border: 1px solid #000000;
    overflow-y: hidden;
    margin-left: auto;
    margin-right: auto;
}

.atrament-container {
    display: flex;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    position: relative;
    font-family: Georgia, sans-serif;
}
</style>
