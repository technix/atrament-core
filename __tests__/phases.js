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

const storyFile = './test.example.ink.json';
let atrament;

beforeEach(() => {
  atrament = new Atrament({storyFile});
  atrament.on('loadStory', fileLoader);
});

describe('phases', () => {
  test('save data to state', async () => {
    let g;
    atrament.onPhase('init', () => ({init: 1}));
    atrament.onPhase('check', () => null);
    await atrament.startGame();
    g = atrament.story.getState();
    expect(g.state).toEqual({});
    // phase which updates state
    atrament.runPhase('init');
    g = atrament.story.getState();
    expect(g.state).toEqual({init: 1});
    // phase which does nothing
    atrament.runPhase('check');
    g = atrament.story.getState();
    expect(g.state).toEqual({init: 1});
  });

  test('update data in state', async () => {
    let g;
    atrament.onPhase('init', () => ({init: 1, test: 2}));
    atrament.onPhase('update', (state) => ({init: state.init + 4}));
    await atrament.startGame();
    atrament.runPhase('init');
    g = atrament.story.getState();
    expect(g.state).toEqual({init: 1, test: 2});
    atrament.runPhase('update');
    g = atrament.story.getState();
    expect(g.state).toEqual({init: 5, test: 2});
  });

  test('update data based on Ink', async () => {
    atrament.onPhase('init', () => ({init: 1, test: 2}));
    atrament.onPhase('update', (state, story) => {
      const testValue = story.getVar('testValue'); // 999
      return {
        init: state.init + testValue,
        test: state.test + testValue
      };
    });
    await atrament.startGame();
    atrament.runPhase('init');
    atrament.runPhase('update');
    const g = atrament.story.getState();
    expect(g.state).toEqual({init: 1000, test: 1001});
  });

  test('save/load store', async () => {
    let savedGameContent;
    const initialState = {init: 1, test: 2};
    const saveGame = async (content) => { savedGameContent = content; };
    const loadGame = async () => JSON.stringify(savedGameContent);
    atrament.on('saveGame', saveGame);
    atrament.onPhase('init', () => (initialState));
    await atrament.startGame();
    atrament.runPhase('init');
    atrament.saveGame();

    const atrament2 = new Atrament({
      storyFile
    });
    atrament2.on('loadStory', fileLoader);
    atrament2.on('loadGame', loadGame);
    await atrament2.loadGame('test');
    const g = atrament.story.getState();
    expect(g.state).toEqual(initialState);
  });
});
