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
    choices: []
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
      tags: choice.tags
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
    emit('ink/makeChoice', id);
    inkStory.ChooseChoiceIndex(id);
  },
  getVisitCount: (ref) => {
    const visitCount = inkStory.VisitCountAtPathString(ref);
    emit('ink/getVisitCount', { ref, visitCount });
    return visitCount;
  },
  evaluateFunction: (...args) => {
    const result = inkStory.EvaluateFunction(...args);
    emit('ink/evaluateFunction', { args, result });
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
    emit('ink/setVariable', { name, value });
    inkStory.variablesState[name] = value;
  },
  observeVariable: (variable, observer) => inkStory.ObserveVariable(variable, observer),
  goTo: (knot) => {
    emit('ink/goTo', knot);
    inkStory.ChoosePathString(knot);
  },
  getScene
};
