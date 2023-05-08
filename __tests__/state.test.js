/* eslint-env jest */
import Atrament from '../src/index';
import storyContent from './test.state.ink.json';

const fileLoaderMock = jest.fn();

function fileLoader(filename) {
  return new Promise((resolve) => {
    fileLoaderMock(filename);
    resolve(storyContent);
  });
}

let savedGameContent;
const saveGame = async (content) => { savedGameContent = content; };
const loadGame = async () => JSON.stringify(savedGameContent);

const storyFile = './test.state.ink.json';

describe('state', () => {
  test('play game as is', async () => {
    const atrament = new Atrament({
      storyFile
    });
    atrament.on('loadStory', fileLoader);
    expect.assertions(2);
    await atrament.startGame();
    atrament.renderScene();
    atrament.makeChoice(1);
    atrament.renderScene();
    expect(atrament.story.getVar('stamina')).toEqual(2);
    expect(atrament.story.getVar('coins')).toEqual(42);
  });

  test('save game after renderScene', async () => {
    expect.assertions(8);

    const atrament1 = new Atrament({
      storyFile
    });
    atrament1.on('loadStory', fileLoader);
    atrament1.on('saveGame', saveGame);
    await atrament1.startGame();
    atrament1.renderScene();
    // variables are initialized
    expect(atrament1.story.getVar('stamina')).toEqual(2);
    expect(atrament1.story.getVar('coins')).toEqual(2);
    atrament1.saveGame('test');
    // load game
    const atrament2 = new Atrament({
      storyFile
    });
    atrament2.on('loadStory', fileLoader);
    atrament2.on('loadGame', loadGame);
    // after loading and re-rendering scene, variables are unchanged
    await atrament2.loadGame('test');
    atrament2.renderScene();
    expect(atrament2.story.getVar('stamina')).toEqual(2);
    expect(atrament2.story.getVar('coins')).toEqual(2);
    // rerender scene again, variables are still unchanged
    atrament2.renderScene();
    expect(atrament2.story.getVar('stamina')).toEqual(2);
    expect(atrament2.story.getVar('coins')).toEqual(2);
    // make choice, game continues
    atrament2.makeChoice(1);
    atrament2.renderScene();
    expect(atrament2.story.getVar('stamina')).toEqual(2);
    expect(atrament2.story.getVar('coins')).toEqual(42);
  });

  test('save game after choice', async () => {
    expect.assertions(6);

    const atrament1 = new Atrament({
      storyFile
    });
    atrament1.on('loadStory', fileLoader);
    atrament1.on('saveGame', saveGame);
    await atrament1.startGame();
    atrament1.renderScene();
    atrament1.makeChoice(1);
    // choice is made, but ink code after the choice is not yet called
    expect(atrament1.story.getVar('stamina')).toEqual(2);
    expect(atrament1.story.getVar('coins')).toEqual(2);
    atrament1.saveGame('test2');
    // load game
    const atrament2 = new Atrament({
      storyFile
    });
    atrament2.on('loadStory', fileLoader);
    atrament2.on('loadGame', loadGame);
    await atrament2.loadGame('test2');
    // variables are unchanged after load
    expect(atrament1.story.getVar('stamina')).toEqual(2);
    expect(atrament1.story.getVar('coins')).toEqual(2);
    atrament2.renderScene();
    // variables are changed because the code after choice is executed
    expect(atrament2.story.getVar('stamina')).toEqual(2);
    expect(atrament2.story.getVar('coins')).toEqual(42);
  });
});
