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

let thisStory;

const AtramentStory = {
  init(storyContent) {
    thisStory = new Story(storyContent);
  },

  getScene() {
    const scene = {
      type: 'text',
      text: [],
      tags: {},
      choices: []
    };
    while (thisStory.canContinue) {
      thisStory.Continue();
      // add story text
      scene.text.push(thisStory.currentText); // eslint-disable-line new-cap
      // add tags
      const tags = parseTags(thisStory.currentTags);
      if (tags.scene) {
        scene.type = tags.scene;
      }
      scene.tags = Object.assign({}, scene.tags, tags);
    }
    thisStory.currentChoices.forEach((choice, id) => {
      scene.choices.push({id, choice: choice.text});
    });
    return scene;
  },

  makeChoice(id) {
    thisStory.ChooseChoiceIndex(id); // eslint-disable-line new-cap
  },

  saveState() {
    return thisStory.state.toJson();
  },

  loadState(jsonState) {
    thisStory.state.LoadJson(jsonState); // eslint-disable-line new-cap
  },

  // get global tags for story
  globalTags() {
    return thisStory.globalTags;
  },

  // get tags for knot
  tagsForKnot(knot) {
    return thisStory.TagsForContentAtPath(knot); // eslint-disable-line new-cap
  },

  // go to knot/stitch
  goTo(ref) {
    thisStory.ChoosePathString(ref); // eslint-disable-line new-cap
  },

  // get variable value
  getVar(name) {
    return thisStory.variablesState[name];
  },

  // get all global variable values
  getVars() {
    const vState = thisStory.variablesState;
    const vars = {};
    // eslint-disable-next-line no-underscore-dangle
    Object.keys(vState._globalVariables).forEach((k) => {
      vars[k] = vState[k];
    });
    return vars;
  },

  // set variable value
  setVar(name, value) {
    thisStory.variablesState[name] = value;
  },

  // batch set variables values
  setVars(vars) {
    Object.keys(vars).forEach((k) => {
      thisStory.variablesState[k] = vars[k];
    });
  },

  // get visit count
  getVisitCount(ref) {
    thisStory.state.VisitCountAtPathString(ref); // eslint-disable-line new-cap
  },

  // register observe variable callback
  // function callback(variableName:string, newValue) {}
  observeVar(name, callback) {
    thisStory.ObserveVariable(name, callback); // eslint-disable-line new-cap
  },

  // bind external function
  // (name, function_definition)
  bindFunction(fnName, functionDef) {
    thisStory.BindExternalFunction(fnName, functionDef); // eslint-disable-line new-cap
  }
};

export default AtramentStory;
