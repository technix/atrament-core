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
  // getters

  getScene(cmdInstance) {
    return getScene(this, cmdInstance);
  }

  saveState() {
    return this.state.toJson();
  }

  loadState(jsonState) {
    this.state.LoadJson(jsonState);
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
