/* eslint-env jest */
import Atrament from '../src/index';
import storyContent from './externalFunction.ink.json';

const fileLoaderMock = jest.fn();

function fileLoader(filename) {
  return new Promise((resolve) => {
    fileLoaderMock(filename);
    resolve(storyContent);
  });
}

const storyFile = './externalFunction.ink.json';
let atrament;

beforeEach(() => {
  atrament = new Atrament({
    storyFile
  });
  atrament.on('loadStory', fileLoader);
});

describe('external functions', () => {
  test('define and run', async () => {
    expect.assertions(2);
    const jestListener = jest.fn();
    atrament.registerFunctions({
      externalFn: (v) => {
        jestListener(v);
        return v + 1;
      }
    });
    await atrament.startGame();
    const scene = atrament.renderScene();
    expect(jestListener).toHaveBeenCalledWith(999);
    expect(scene.text[0]).toBe('externalFn=1000\n');
  });
});
