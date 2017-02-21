import {Story} from 'inkjs/dist/ink';

class AtramentStory {
    constructor(storyContent) {
        this.story = new Story(storyContent);
    }

    getScene() {
        const scene = {
            text: [],
            tags: [],
            choices: []
        };
        while (this.story.canContinue) {
            scene.text.push(this.story.Continue()); // eslint-disable-line new-cap
            scene.tags.push(this.story.currentTags); // eslint-disable-line new-cap
        }
        this.story.currentChoices.forEach((choice, index) => {
            scene.choices.push({id: index, text: choice.text});
        });
        return scene;
    }

    makeChoice(id) {
        this.story.ChooseChoiceIndex(id); // eslint-disable-line new-cap
    }

    saveState() {
        return this.story.state.toJson();
    }

    loadState(jsonState) {
        this.story.state.LoadJson(jsonState); // eslint-disable-line new-cap
    }

    // get global tags for story
    globalTags() {
        return this.story.globalTags;
    }

    // get tags for knot
    tagsForKnot(knot) {
        return this.story.TagsForContentAtPath(knot); // eslint-disable-line new-cap
    }

    // go to knot/stitch
    goTo(ref) {
        this.story.ChoosePathString(ref); // eslint-disable-line new-cap
    }

    // get variable value
    getVar(name) {
        return this.story.variablesState[name];
    }

    // set variable value
    setVar(name, value) {
        this.story.variablesState[name] = value;
    }

    // get visit count
    getVisitCount(ref) {
        this.story.state.VisitCountAtPathString(ref); // eslint-disable-line new-cap
    }

    // register observe variable callback
    // function callback(variableName:string, newValue) {}
    observeVar(name, callback) {
        this.story.ObserveVariable(name, callback); // eslint-disable-line new-cap
    }

    // bind external function
    // (name, function_definition)
    bindFunction(fnName, functionDef) {
        this.story.BindExternalFunction(fnName, functionDef); // eslint-disable-line new-cap
    }
}

export default AtramentStory;
