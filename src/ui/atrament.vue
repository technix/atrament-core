<template>
    <div class="atrament-scroll">
        <div class="atrament-container">
            <story-component :story="story"></story-component>
        </div>
    </div>
</template>

<script>
import Story from './story.vue';

export default {
    props: ['story'],
    components: {
        'story-component': Story
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
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    position: relative;
}
</style>
