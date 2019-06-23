/* eslint-env jest */
import Atrament from '../src/index';
import storyContent from './test.example.ink.json';

const fileLoaderMock = jest.fn();

function fileLoader(filename) {
  return new Promise((resolve) => {
    fileLoaderMock(filename);
    resolve(storyContent);
  });
}

function fileLoaderString(filename) {
  return new Promise((resolve) => {
    fileLoaderMock(filename);
    resolve(JSON.stringify(storyContent));
  });
}


const storyFile = './test.example.ink.json';
let atrament;

beforeEach(() => {
  atrament = new Atrament({
    storyFile
  });
});


const expectedScene = {
  choices: [
    {
      choice: 'Choice',
      id: 0
    },
    {
      choice: 'Command',
      id: 1
    },
    {
      choice: 'testValues',
      id: 2
    },
    {
      choice: 'testValue+1000',
      id: 3
    },
    {
      choice: 'changeValue_function',
      id: 4
    }
  ],
  content: [
    {
      tags: {},
      text: 'Intro paragraph 1\n'
    },
    {
      tags: {p2: 'tag for paragraph 2'},
      text: 'Intro paragraph 2\n'
    },
    {
      tags: {p3: {key1: 1, key2: 'alpha'}},
      text: 'Intro paragraph 3\n'
    }
  ],
  id: 0,
  isActive: true,
  tags: {
    p2: 'tag for paragraph 2',
    p3: {key1: 1, key2: 'alpha'}
  },
  text: [
    'Intro paragraph 1\n',
    'Intro paragraph 2\n',
    'Intro paragraph 3\n'
  ],
  type: 'text'
};

describe('loader', () => {
  test('story is loaded as JSON', async () => {
    atrament.on('loadStory', fileLoader);
    expect.assertions(3);
    expect(fileLoaderMock).not.toHaveBeenCalled();
    await atrament.startGame();
    expect(fileLoaderMock).toHaveBeenCalledWith(storyFile);
    expect(atrament.renderScene()).toEqual(expectedScene);
  });

  test('story is loaded as string', async () => {
    atrament.on('loadStory', fileLoaderString);
    expect.assertions(3);
    expect(fileLoaderMock).not.toHaveBeenCalled();
    await atrament.startGame();
    expect(fileLoaderMock).toHaveBeenCalledWith(storyFile);
    expect(atrament.renderScene()).toEqual(expectedScene);
  });
});

describe('story', () => {
  beforeEach(() => {
    atrament.on('loadStory', fileLoader);
  });

  test('choices', async () => {
    let scene;
    expect.assertions(4);
    await atrament.startGame();
    atrament.renderScene();
    await atrament.makeChoice(0);
    scene = atrament.renderScene();
    expect(scene.text[0]).toEqual('Selected choice\n');
    expect(scene.choices[0]).toEqual({id: 0, choice: 'End script'});
    await atrament.makeChoice(0);
    scene = atrament.renderScene();
    expect(scene.text[0]).toEqual('End\n');
    expect(scene.choices).toEqual([]); // empty choices - end of the game
  });

  test('getVar/setVar', async () => {
    let testValue;
    expect.assertions(3);
    await atrament.startGame();
    // getVar
    testValue = atrament.story.getVar('testValue');
    expect(testValue).toEqual(999);
    // setVar
    atrament.story.setVar('testValue', 888);
    testValue = atrament.story.getVar('testValue');
    expect(testValue).toEqual(888);
    // check if variable is set
    atrament.renderScene();
    await atrament.makeChoice(2);
    const scene = atrament.renderScene();
    expect(scene.text[0]).toEqual('testValue=888\n');
  });

  test('getVars/setVars', async () => {
    expect.assertions(3);
    await atrament.startGame();
    // getVars
    const testValues = atrament.story.getVars();
    expect(testValues).toEqual({
      testValue: 999,
      otherTestValue: 123
    });
    // setVars
    atrament.story.setVars({testValue: 777, otherTestValue: 333});
    // check if variable is set
    atrament.renderScene();
    await atrament.makeChoice(2);
    const scene = atrament.renderScene();
    expect(scene.text[0]).toEqual('testValue=777\n');
    expect(scene.text[1]).toEqual('otherTestValue=333\n');
  });

  test('variable listeners', async () => {
    expect.assertions(2);
    const testValueObserver = jest.fn();
    atrament.registerObservers({
      testValue: testValueObserver
    });
    await atrament.startGame();
    atrament.renderScene();
    await atrament.makeChoice(3);
    atrament.renderScene();
    expect(testValueObserver).toHaveBeenCalledTimes(1);
    expect(testValueObserver).toHaveBeenCalledWith('testValue', 1999);
  });

  /*
  test('call Ink functions', async () => {
    expect.assertions(2);
    await atrament.startGame();
    const result = atrament.story.EvaluateFunction('decreaseTestValue', 99, true);
    expect(result).toBe({
      returned: 'a',
      output: 'o'
    });
    atrament.renderScene();
    await atrament.makeChoice(2);
    const scene = atrament.renderScene();
    expect(scene.text[0]).toEqual('testValue=777\n');
  });
  */

  describe('command', () => {
    test('not registered', async () => {
      expect.assertions(2);
      await atrament.startGame();
      atrament.renderScene();
      await atrament.makeChoice(1);
      const scene = atrament.renderScene();
      expect(scene.text[0]).toBe('>>> TESTCOMMAND arg1 arg2\n');
      expect(scene.text[1]).toBe('testcommand\n');
    });

    test('callback', async () => {
      expect.assertions(2);
      const testCommandCallback = jest.fn();
      atrament.registerCommand('TESTCOMMAND', testCommandCallback);
      await atrament.startGame();
      atrament.renderScene();
      await atrament.makeChoice(1);
      const scene = atrament.renderScene();
      expect(testCommandCallback).toHaveBeenCalledWith(
        ['arg1', 'arg2'],
        atrament.story, // story object
        'TESTCOMMAND'
      );
      expect(scene.text[0]).toBe('testcommand\n');
    });

    test('replacer', async () => {
      expect.assertions(2);
      atrament.registerCommand('TESTCOMMAND', (args) => `${args[0]}=${args[1]}\n`);
      await atrament.startGame();
      atrament.renderScene();
      await atrament.makeChoice(1);
      const scene = atrament.renderScene();
      expect(scene.text[0]).toBe('arg1=arg2\n');
      expect(scene.text[1]).toBe('testcommand\n');
    });
  });
});
