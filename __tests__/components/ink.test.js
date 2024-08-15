/* eslint-env jest */
import { emit } from '../../src/utils/emitter';
import { setConfig } from '../../src/utils/config';

import ink from '../../src/components/ink';

jest.mock('../../src/utils/emitter', () => ({
  emit: jest.fn()
}));

jest.useFakeTimers();

const mockInkStoryInstance = {
  content: '',
  sceneCounter: 1,
  globalTags: ['title: test story', 'autosave', 'single_scene', 'observe: var1'],
  state: {
    LoadJson: jest.fn(),
    toJson: jest.fn(() => ({ inkstate: 'jsonStructure' }))
  },
  onError: () => {},
  canContinue: true,
  currentChoices: [],
  Continue() {
    if (this.sceneCounter === 1) {
      this.currentText = '\n';
    } else {
      this.currentText = `Paragraph ${this.sceneCounter}.`;
    }
    this.currentTags = ['HELLO', 'WORLD'];
    this.sceneCounter += 1;
    if (this.sceneCounter > 3) {
      this.canContinue = false;
      this.currentChoices = [
        { text: 'Option 1' },
        { text: 'Option 2', tags: ['CHOICE', 'TEST: optional'] }
      ];
    }
  },
  ChooseChoiceIndex() {
    this.currentChoices = [];
    this.canContinue = true;
  },
  VisitCountAtPathString() {
    return 5;
  },
  EvaluateFunction(fn, args) {
    return `${fn} result: ${args[0] + args[1]}`;
  },
  variablesState: {
    var1: 'var1-value'
  },
  ObserveVariable() {
    return true;
  },
  ChoosePathString() {
    return true;
  },
  ResetState() {
    return true;
  }
};

const MockInkStory = jest.fn((content) => {
  mockInkStoryInstance.content = content;
  return mockInkStoryInstance;
});

const spyContinue = jest.spyOn(mockInkStoryInstance, 'Continue');
const spyChooseChoiceIndex = jest.spyOn(mockInkStoryInstance, 'ChooseChoiceIndex');
const spyVisitCountAtPathString = jest.spyOn(mockInkStoryInstance, 'VisitCountAtPathString');
const spyEvaluateFunction = jest.spyOn(mockInkStoryInstance, 'EvaluateFunction');
const spyObserveVariable = jest.spyOn(mockInkStoryInstance, 'ObserveVariable');
const spyChoosePathString = jest.spyOn(mockInkStoryInstance, 'ChoosePathString');
const spyResetState = jest.spyOn(mockInkStoryInstance, 'ResetState');


beforeEach(() => {
  jest.clearAllMocks();
  mockInkStoryInstance.content = '';
  mockInkStoryInstance.currentChoices = [];
  mockInkStoryInstance.sceneCounter = 1;
  mockInkStoryInstance.canContinue = true;
});

describe('components/ink', () => {
  test('initStory', () => {
    const content = 'ink json';
    setConfig(MockInkStory, {});
    ink.initStory(content);
    const story = ink.story();
    expect(MockInkStory).toHaveBeenCalledWith(content);
    expect(story).toEqual(mockInkStoryInstance);
    expect(emit).toHaveBeenCalledWith('ink/initStory');
  });

  test('resetStory', () => {
    expect(spyResetState).toHaveBeenCalledTimes(0);
    ink.resetStory();
    expect(spyResetState).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('ink/resetStory', true);
  });

  test('loadState', () => {
    expect(mockInkStoryInstance.state.LoadJson).not.toHaveBeenCalled();
    ink.loadState('saved-state');
    expect(mockInkStoryInstance.state.LoadJson).toHaveBeenCalledWith('saved-state');
  });

  test('getState', () => {
    expect(mockInkStoryInstance.state.toJson).not.toHaveBeenCalled();
    const state = ink.getState('saved-state');
    expect(state).toEqual({ inkstate: 'jsonStructure' });
    expect(mockInkStoryInstance.state.toJson).toHaveBeenCalledTimes(1);
  });

  test('makeChoice', () => {
    const choiceId = '1';
    expect(spyChooseChoiceIndex).not.toHaveBeenCalled();
    ink.makeChoice(choiceId);
    expect(spyChooseChoiceIndex).toHaveBeenCalledWith(choiceId);
    expect(emit).toHaveBeenCalledWith('ink/makeChoice', choiceId);
  });

  test('getVisitCount', () => {
    expect(spyVisitCountAtPathString).not.toHaveBeenCalled();
    const count = ink.getVisitCount('ref');
    expect(count).toEqual(5);
    expect(spyVisitCountAtPathString).toHaveBeenCalledWith('ref');
    expect(emit).toHaveBeenCalledWith('ink/getVisitCount', { ref: 'ref', visitCount: 5 });
  });

  test('evaluateFunction', () => {
    expect(spyEvaluateFunction).not.toHaveBeenCalled();
    const result = ink.evaluateFunction('testfunction', [3, 4]);
    expect(result).toEqual('testfunction result: 7');
    expect(spyEvaluateFunction).toHaveBeenCalledWith('testfunction', [3, 4], undefined);
    expect(emit).toHaveBeenCalledWith(
      'ink/evaluateFunction',
      { function: 'testfunction', args: [3, 4], result: 'testfunction result: 7' }
    );
  });

  test('getGlobalTags', () => {
    const globaltags = ink.getGlobalTags();
    const expectedGlobalTags = {
      single_scene: true,
      autosave: true,
      observe: 'var1',
      title: 'test story'
    };
    expect(globaltags).toEqual(expectedGlobalTags);
    expect(emit).toHaveBeenCalledWith('ink/getGlobalTags', expectedGlobalTags);
  });

  test('getVariable', () => {
    const expectedValue = mockInkStoryInstance.variablesState.var1;
    const result = ink.getVariable('var1');
    expect(result).toEqual(expectedValue);
    expect(emit).toHaveBeenCalledWith('ink/getVariable', { name: 'var1', value: expectedValue });
  });

  test('setVariable', () => {
    ink.setVariable('varTest', 10);
    const expectedValue = mockInkStoryInstance.variablesState.varTest;
    expect(expectedValue).toEqual(10);
    expect(emit).toHaveBeenCalledWith('ink/setVariable', { name: 'varTest', value: 10 });
  });

  test('observeVariable', () => {
    expect(spyObserveVariable).not.toHaveBeenCalled();
    const handler = () => 'var-handler';
    ink.observeVariable('var1', handler);
    expect(spyObserveVariable).toHaveBeenCalledWith('var1', handler);
  });

  test('goTo', () => {
    expect(spyChoosePathString).not.toHaveBeenCalled();
    const knot = 'knotAddress';
    ink.goTo(knot);
    expect(spyChoosePathString).toHaveBeenCalledWith(knot);
    expect(emit).toHaveBeenCalledWith('ink/goTo', knot);
  });

  test('onError', () => {
    const errorEvent = { error: 'Internal error' };
    let checkErrorEvent = null;
    ink.onError((error) => { checkErrorEvent = error; });
    // check
    expect(checkErrorEvent).not.toEqual(errorEvent);
    ink.story().onError(errorEvent);
    expect(checkErrorEvent).toEqual(errorEvent);
    expect(emit).toHaveBeenCalledWith('ink/onError', errorEvent);
  });

  test('getScene', () => {
    expect(spyContinue).not.toHaveBeenCalled();
    const expectedScene = {
      content: [
        {
          text: '\n',
          tags: { HELLO: true, WORLD: true }
        },
        {
          text: 'Paragraph 2.',
          tags: { HELLO: true, WORLD: true }
        }
      ],
      text: [
        '\n',
        'Paragraph 2.'
      ],
      tags: {
        HELLO: true,
        WORLD: true
      },
      canContinue: true, // in "continue" mode, adds canContinue flag
      choices: [],
      uuid: jest.now() // equivalent to Date.now()
    };
    const scene = ink.getScene();
    expect(spyContinue).toHaveBeenCalledTimes(2); // first paragraph has "\n"
    expect(scene).toEqual(expectedScene);
    expect(emit).toHaveBeenCalledWith('ink/getScene', scene);
  });

  test('getScene - maximal continue', () => {
    expect(spyContinue).not.toHaveBeenCalled();
    const expectedScene = {
      content: [
        {
          text: '\n',
          tags: { HELLO: true, WORLD: true }
        },
        {
          text: 'Paragraph 2.',
          tags: { HELLO: true, WORLD: true }
        },
        {
          text: 'Paragraph 3.',
          tags: { HELLO: true, WORLD: true }
        }
      ],
      text: [
        '\n',
        'Paragraph 2.',
        'Paragraph 3.'
      ],
      tags: {
        HELLO: true,
        WORLD: true
      },
      choices: [
        { id: 0, choice: 'Option 1', tags: {} },
        { id: 1, choice: 'Option 2', tags: { CHOICE: true, TEST: 'optional' } }
      ],
      uuid: jest.now() // equivalent to Date.now()
    };
    const scene = ink.getScene(true);
    expect(spyContinue).toHaveBeenCalledTimes(3);
    expect(scene).toEqual(expectedScene);
    expect(emit).toHaveBeenCalledWith('ink/getScene', scene);
  });
});
