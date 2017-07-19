<template>
<div class="splash-container" v-bind:style="scene.tags.styleScene">
    <a href="#" v-on:click="select(choice)" v-for="choice in scene.choices" :key="choice.id" 
     class="splash-choice" v-bind:style="choiceStyle[choice.id]"
     v-html="choice.choice"></a>
</div>
</template>

<script>
export default {
    props: ['scene'],
    methods: {
        select(choice) {
            this.$atrament.continueStory(this.scene.id, choice.id);
        }
    },
    computed: {
        choiceStyle: function () {
            const styles = [];
            if (this.scene.tags['styleChoices']) {
                this.scene.tags.styleChoices.styles.forEach((s) => {
                    styles.push(Object.assign({},this.scene.tags.styleAllChoices, s));
                });
            }
            return styles;
        }
    }
};
</script>

<style>
.splash-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.splash-choice {
    position: absolute;
    display: block;
    text-decoration: none;
}
</style>
