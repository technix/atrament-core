/* eslint-env jest */
import Atrament from '../src/index';
import storyContent from './test.progress.ink.json';

const fileLoaderMock = jest.fn();

function fileLoader(filename) {
  return new Promise((resolve) => {
    fileLoaderMock(filename);
    resolve(storyContent);
  });
}

const storyFile = './test.progress.ink.json';

const expectedEpisode = [
  {
    choices: [{choice: 'Choice 1a', id: 0}, {choice: 'Choice 1b', id: 1}],
    content: [{tags: {}, text: 'P1\n'}],
    id: 0,
    isActive: false,
    tags: {},
    text: ['P1\n'],
    type: 'text'
  },
  {
    choices: [{choice: 'Choice 2a', id: 0}, {choice: 'Choice 2b', id: 1}],
    content: [{tags: {}, text: 'Choice 1b\n'}, {tags: {}, text: 'P2\n'}],
    id: 1,
    isActive: false,
    tags: {},
    text: ['Choice 1b\n', 'P2\n'],
    type: 'text'
  },
  {
    choices: [{choice: 'Choice 3a', id: 0}, {choice: 'Choice 3b', id: 1}],
    content: [{tags: {}, text: 'Choice 2a\n'}, {tags: {}, text: 'P3\n'}],
    id: 2,
    isActive: false,
    tags: {},
    text: ['Choice 2a\n', 'P3\n'],
    type: 'text'
  },
  {
    choices: [],
    content: [{tags: {}, text: 'Choice 3b\n'}, {tags: {}, text: 'END\n'}],
    id: 3,
    isActive: true,
    tags: {},
    text: ['Choice 3b\n', 'END\n'],
    type: 'text'
  }
];

async function playGame(atrament) {
  await atrament.startGame();
  atrament.renderScene();
  await atrament.makeChoice(1);
  atrament.renderScene();
  await atrament.makeChoice(0);
  atrament.renderScene();
  await atrament.makeChoice(1);
  return atrament.renderScene();
}


describe('playthrough', () => {
  test('scene/episode', async () => {
    const atrament = new Atrament({
      storyFile
    });
    atrament.on('loadStory', fileLoader);
    expect.assertions(2);
    const lastScene = await playGame(atrament);
    expect(atrament.story.getCurrentScene()).toEqual(lastScene);
    expect(atrament.story.getCurrentEpisode()).toEqual(expectedEpisode);
  });

  test('transcript', async () => {
    const atrament = new Atrament({
      storyFile,
      transcript: true
    });
    atrament.on('loadStory', fileLoader);
    expect.assertions(2);
    await playGame(atrament);
    // deep copy
    const expectedTranscript = JSON.parse(JSON.stringify(expectedEpisode));
    // transcript has information about chosen choices
    expectedTranscript[0].chosen = 1;
    expectedTranscript[1].chosen = 0;
    expectedTranscript[2].chosen = 1;
    expect(atrament.getTranscript()).toEqual(expectedTranscript);
    // episode in transcript mode also contains information on choices
    expect(atrament.story.getCurrentEpisode()).toEqual(expectedTranscript);
  });

  test('save/load', async () => {
    const expectedGameContent = {
      id: 'test',
      data: {
        episode: [
          {
            type: 'text',
            content: [{text: 'P1\n', tags: {}}],
            text: ['P1\n'],
            tags: {},
            choices: [{id: 0, choice: 'Choice 1a'}, {id: 1, choice: 'Choice 1b'}],
            isActive: false,
            id: 0
          },
          {
            type: 'text',
            content: [{text: 'Choice 1b\n', tags: {}}, {text: 'P2\n', tags: {}}],
            text: ['Choice 1b\n', 'P2\n'],
            tags: {},
            choices: [{id: 0, choice: 'Choice 2a'}, {id: 1, choice: 'Choice 2b'}],
            isActive: true,
            id: 1
          }
        ],
        story: {
          callstackThreads: {
            threads: [
              {
                callstack: [{exp: false, type: 0, temp: {$r: {'^->': '0.g-0.3.$r1'}}}],
                threadIndex: 2,
                previousContentObject: '0.g-0.3.8'
              }
            ],
            threadCounter: 2
          },
          choiceThreads: {
            1: {
              callstack: [
                {
                  cPath: '0.g-0.2',
                  exp: false,
                  idx: 8,
                  temp: {
                    $r: {
                      '^->': '0.g-0.2.$r1'
                    }
                  },
                  type: 0
                }
              ],
              previousContentObject: '0.g-0.2.7',
              threadIndex: 1
            }
          },
          variablesState: {},
          evalStack: [],
          outputStream: ['^P2', '\n'],
          currentChoices: [
            {
              text: 'Choice 2a',
              index: 0,
              originalChoicePath: '0.g-0.2.8',
              originalThreadIndex: 1,
              targetPath: '0.g-0.c-2'
            },
            {
              text: 'Choice 2b',
              index: 1,
              originalChoicePath: '0.g-0.3.8',
              originalThreadIndex: 2,
              targetPath: '0.g-0.c-3'
            }
          ],
          visitCounts: {'0.c-1': 1},
          turnIndices: {},
          turnIdx: 0,
          storySeed: expect.any(Number),
          previousRandom: 0,
          inkSaveVersion: 8,
          inkFormatVersion: 19
        }
      }
    };
    let savedGameContent;
    const saveGame = async (content) => { savedGameContent = content; };
    const loadGame = async () => JSON.stringify(savedGameContent);

    expect.assertions(3);

    const atrament = new Atrament({
      storyFile
    });
    atrament.on('loadStory', fileLoader);
    atrament.on('saveGame', saveGame);
    await atrament.startGame();
    atrament.renderScene();
    await atrament.makeChoice(1);
    atrament.renderScene();
    const savedScene = atrament.story.getCurrentScene();
    const savedEpisode = atrament.story.getCurrentEpisode();
    await atrament.saveGame('test');
    expect(savedGameContent).toEqual(expectedGameContent);

    const atrament2 = new Atrament({
      storyFile
    });
    atrament2.on('loadStory', fileLoader);
    atrament2.on('loadGame', loadGame);
    await atrament2.loadGame('test');
    atrament2.renderScene();
    expect(atrament.story.getCurrentScene()).toEqual(savedScene);
    expect(atrament.story.getCurrentEpisode()).toEqual(savedEpisode);
  });
});
