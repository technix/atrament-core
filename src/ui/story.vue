<template>
    <div class="story-container" v-if="story">
        <div v-if="story[0].type === 'splash'">
            <splash-component :scene="story[0]"></splash-component>
        </div>
        <div v-if="story[0].type === 'text'">
            <scene-component v-for="scene in story" :scene="scene" :key="scene.id"></scene-component>
        </div>
    </div>
</template>

<script>
import Scene from './scene.vue';
import Splash from './splash.vue';

export default {
    props: ['story'],
    components: {
        'scene-component': Scene,
        'splash-component': Splash
    }
};
</script>

<style>
.story-container {
    width: 100%;
    margin: auto;
}
</style>
