import {Story} from 'inkjs/dist/ink-es2015';

function parseTags(tags) {
    const tagsObj = {};
    tags.forEach((item) => {
        const line = item.split(':');
        const key = line[0].trim();
        let content = line.slice(1).join(':').trim();
        if (content.substr(0, 1) === '{') {
            content = JSON.parse(content); // this is JSON
        }
        tagsObj[key] = content;
    });
    return tagsObj;
}


class AtramentStory {
    constructor(storyContent) {
        this.story = new Story(storyContent);
    }

    getScene() {
        const scene = {
            type: 'text',
            text: [],
            tags: {},
            choices: []
        };
        while (this.story.canContinue) {
            this.story.Continue();
            // add story text
            scene.text.push(this.story.currentText); // eslint-disable-line new-cap
            // add tags
            const tags = parseTags(this.story.currentTags);
            if (tags.scene) {
                scene.type = tags.scene;
            }
            scene.tags = Object.assign({}, scene.tags, tags);
        }
        this.story.currentChoices.forEach((choice, id) => {
            scene.choices.push({id, choice: choice.text});
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

    // get all global variable values
    getVars() {
        const vState = this.story.variablesState;
        const vars = {};
        // eslint-disable-next-line no-underscore-dangle
        Object.keys(vState._globalVariables).forEach((k) => {
            vars[k] = vState[k];
        });
        return vars;
    }

    // set variable value
    setVar(name, value) {
        this.story.variablesState[name] = value;
    }

    // batch set variables values
    setVars(vars) {
        Object.keys(vars).forEach((k) => {
            this.story.variablesState[k] = vars[k];
        });
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
