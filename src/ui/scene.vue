<template>
<div class="scene-container">
    <div class="text-wrapper">
        <p v-for="paragraph in scene.text" v-html="paragraph"></p>
    </div>
    <div class="choice-wrapper" v-if="scene.isActive">
        <a href="#" v-on:click="select(choice)" v-for="choice in scene.choices" class="choice" v-html="choice.choice"></a>
    </div>
</div>
</template>

<script>
export default {
    props: ['scene'],
    methods: {
        select(choice) {
            this.$atrament.continueStory(this.scene.id, choice.id);
        }
    }
};
</script>

<style>
.text-wrapper {
    padding: 10px;
    border-top: 1px dashed #CCCCCC;
}

.choice-wrapper {
    text-align: left;
    padding-top: 0px;
    padding: 10px;
}

.choice-wrapper a {
    display: block;
    width: 80%;
    border-top: 1px solid #EEEEEE;
    padding: 4px;
    margin-bottom: 10px;
    color: #333399;
}

.choice {
    display: block;
    width: 100%;
    text-decoration: none;
}
</style>
