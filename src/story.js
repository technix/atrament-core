import {Story} from 'inkjs/dist/ink-es2015';
import getScene from './scene';

/*
  * make choice:        story.ChooseChoiceIndex(choiceId)
  * get global tags:    story.globalTags
  * get tags for knot:  story.TagsForContentAtPath(knot)
  * go to knot/stitch:  story.ChoosePathString(ref)
  * register observer variable:
      function callback(variableName:string, newValue) {}
      story.ObserveVariable(varName, callback);
  * bind external function:
      story.BindExternalFunction(name, function_definition)
*/

class AtramentStory extends Story {
  constructor(storyContent) {
    super(storyContent);
    this.$episode = [];
    this.$sceneId = -1;
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
      story: JSON.parse(this.state.toJson())
    };
  }

  // restore
  restoreState(state) {
    this.$episode = state.episode;
    this.state.LoadJson(JSON.stringify(state.story));
  }

  // get variable value
  getVar(name) {
    return this.variablesState[name];
  }

  // get all global variable values
  getVars() {
    const vState = this.variablesState;
    const vars = {};
    // eslint-disable-next-line no-underscore-dangle
    Object.keys(vState._globalVariables).forEach((k) => {
      vars[k] = vState[k];
    });
    return vars;
  }

  // set variable value
  setVar(name, value) {
    this.variablesState[name] = value;
  }

  // batch set variables values
  setVars(vars) {
    Object.keys(vars).forEach((k) => {
      this.variablesState[k] = vars[k];
    });
  }

  // get visit count
  getVisitCount(ref) {
    this.state.VisitCountAtPathString(ref);
  }
}

export default AtramentStory;
