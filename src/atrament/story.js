var inkjs = require('inkjs/dist/ink.js');

function AtramentStory(storyContent) {
    this.story = new inkjs.Story(storyContent);
    return this;
}
AtramentStory.prototype.getScene = function getScene() {
    var scene = {
        text: [],
        tags: [],
        choices: []
    };
    while (this.story.canContinue) {
        scene.text.push(this.story.Continue()); // eslint-disable-line new-cap
        scene.tags.push(this.story.currentTags); // eslint-disable-line new-cap
    }
    this.story.currentChoices.forEach(function choiceFn(choice, index) {
        scene.choices.push({id: index, text: choice.text});
    });
    return scene;
};
AtramentStory.prototype.makeChoice = function makeChoice(id) {
    this.story.ChooseChoiceIndex(id); // eslint-disable-line new-cap
};
AtramentStory.prototype.saveState = function saveState() {
    return this.story.state.toJson();
};
AtramentStory.prototype.loadState = function loadState(jsonState) {
    this.story.state.LoadJson(jsonState); // eslint-disable-line new-cap
};
// get global tags for story
AtramentStory.prototype.globalTags = function globalTags() {
    return this.story.globalTags;
};
// get tags for knot
AtramentStory.prototype.tagsForKnot = function tagsForKnot(knot) {
    return this.story.TagsForContentAtPath(knot); // eslint-disable-line new-cap
};
// go to knot/stitch
AtramentStory.prototype.goTo = function goTo(ref) {
    this.story.ChoosePathString(ref); // eslint-disable-line new-cap
};
// get variable value
AtramentStory.prototype.getVar = function getVar(name) {
    return this.story.variablesState.$(name);
};
// set variable value
AtramentStory.prototype.setVar = function setVar(name, value) {
    this.story.variablesState.$(name, value);
};
// get visit count
AtramentStory.prototype.getVisitCount = function getVisitCount(ref) {
    this.story.state.VisitCountAtPathString(ref); // eslint-disable-line new-cap
};
// register observe variable callback
// function callback(variableName:string, newValue) {}
AtramentStory.prototype.observeVar = function observeVar(name, callback) {
    this.story.ObserveVariable(name, callback); // eslint-disable-line new-cap
};
// bind external function
// (name, function_definition)
AtramentStory.prototype.bindFunction = function bindFunction(fnName, functionDef) {
    this.story.BindExternalFunction(fnName, functionDef); // eslint-disable-line new-cap
};

module.exports = AtramentStory;
