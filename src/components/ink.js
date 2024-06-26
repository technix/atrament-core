import { parseTags } from '../utils/tags';
import { getConfig } from '../utils/config';
import { emit } from '../utils/emitter';

let inkStory = null;

function initStory(content) {
  const { InkStory } = getConfig();
  inkStory = new InkStory(content);
  emit('ink/initStory');
}

// get scene from ink
function getScene() {
  const scene = {
    content: [],
    text: [],
    tags: {},
    choices: [],
    uuid: Date.now()
  };
  while (inkStory.canContinue) {
    inkStory.Continue();
    // add story text
    scene.text.push(inkStory.currentText);
    // add tags
    const tags = parseTags(inkStory.currentTags);
    scene.tags = { ...scene.tags, ...tags };
    // save content - text along with tags
    scene.content.push({ text: inkStory.currentText, tags });
  }
  inkStory.currentChoices.forEach((choice, id) => {
    scene.choices.push({
      id,
      choice: choice.text,
      tags: parseTags(choice.tags)
    });
  });
  emit('ink/getScene', scene);
  return scene;
}

export default {
  initStory,
  story: () => inkStory,
  loadState: (savedState) => inkStory.state.LoadJson(savedState),
  getState: () => inkStory.state.toJson(),
  makeChoice: (id) => {
    inkStory.ChooseChoiceIndex(id);
    emit('ink/makeChoice', id);
  },
  getVisitCount: (ref) => {
    const visitCount = inkStory.VisitCountAtPathString(ref);
    emit('ink/getVisitCount', { ref, visitCount });
    return visitCount;
  },
  evaluateFunction: (fn, args, returnTextOutput) => {
    const result = inkStory.EvaluateFunction(fn, args, returnTextOutput);
    emit('ink/evaluateFunction', { function: fn, args, result });
    return result;
  },
  getGlobalTags: () => {
    const globalTags = parseTags(inkStory.globalTags);
    emit('ink/getGlobalTags', globalTags);
    return globalTags;
  },
  getVariable: (name) => {
    const value = inkStory.variablesState[name];
    emit('ink/getVariable', { name, value });
    return value;
  },
  setVariable: (name, value) => {
    inkStory.variablesState[name] = value;
    emit('ink/setVariable', { name, value });
  },
  observeVariable: (variable, observer) => inkStory.ObserveVariable(variable, observer),
  goTo: (knot) => {
    inkStory.ChoosePathString(knot);
    emit('ink/goTo', knot);
  },
  getScene
};
