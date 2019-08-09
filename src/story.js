import {Story} from 'inkjs/dist/ink';
import getScene from './scene';

/*
  * make choice:        story.$ink.ChooseChoiceIndex(choiceId)
  * get tags:           story.$ink.currentTags
  * get global tags:    story.$ink.globalTags
  * get tags for knot:  story.$ink.TagsForContentAtPath(knot)
  * go to knot/stitch:  story.$ink.ChoosePathString(ref)
  * register observer variable:
      function callback(variableName:string, newValue) {}
      story.$ink.ObserveVariable(varName, callback);
  * bind external function:
      story.$ink.BindExternalFunction(name, function_definition)
  * call ink function:
      story.$ink.EvaluateFunction(inkFunctionName, argsArray, returnTextOutput)
      (if returnTextOutput is true, returns
       {'returned': functionResult, 'output': functionTextOutput},
       otherwise returns just functionResult.)
*/

class AtramentStory {
  constructor(storyContent) {
    this.$ink = new Story(storyContent);
    this.$episode = [];
    this.$sceneId = -1;
    this.$extState = {};
  }

  clearEpisode() {
    this.$episode.splice(0);
    this.$sceneId = -1;
  }

  getCurrentEpisode() {
    return this.$episode;
  }

  getCurrentScene() {
    return this.$episode[this.$episode.length - 1];
  }

  renderScene(cmdInstance) {
    const scene = getScene(this, cmdInstance);
    return this.updateEpisode(scene);
  }

  // getters
  updateEpisode(scene) {
    // deactivate previous scene
    if (this.$sceneId >= 0) {
      this.$episode[this.$sceneId].isActive = false;
    }
    this.$sceneId += 1;
    // append new scene
    scene.isActive = true;
    scene.id = this.$sceneId;
    this.$episode.push(scene);
    return scene;
  }

  // get state snapshot
  getState() {
    return {
      episode: this.$episode,
      state: this.$extState,
      story: JSON.parse(this.$ink.state.toJson())
    };
  }

  // restore
  restoreState(state) {
    this.$episode = state.episode;
    this.$extState = state.state;
    this.$ink.state.LoadJson(JSON.stringify(state.story));
  }

  // get variable value
  getVar(name) {
    return this.$ink.variablesState[name];
  }

  // get all global variable values
  getVars() {
    const vState = this.$ink.variablesState;
    const vars = {};
    // eslint-disable-next-line no-underscore-dangle
    vState._globalVariables.forEach((v, k) => {
      vars[k] = vState[k];
    });
    return vars;
  }

  // set variable value
  setVar(name, value) {
    this.$ink.variablesState[name] = value;
  }

  // batch set variables values
  setVars(vars) {
    Object.keys(vars).forEach((k) => {
      this.$ink.variablesState[k] = vars[k];
    });
  }

  // get visit count
  getVisitCount(ref) {
    this.$ink.state.VisitCountAtPathString(ref);
  }

  // evaluate function
  evaluateFunction(...args) {
    return this.$ink.EvaluateFunction(...args);
  }

  updateExtStateWith(action) {
    const diff = action(this.$extState, this);
    if (diff) {
      this.$extState = {...this.$extState, ...diff};
    }
  }
}

export default AtramentStory;
