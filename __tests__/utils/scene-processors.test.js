/* eslint-env jest */
import internalSceneProcessors from '../../src/utils/scene-processors';


describe('utils/scene-processors', () => {
  describe('#IMAGE tags', () => {
    test('single image', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: { IMAGE: 'img.jpg' }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: { IMAGE: 'img.jpg' },
          images: ['img.jpg'],
          sounds: [],
          music: []
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg'],
        sounds: [],
        music: []
      });
    });

    test('multiple images', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: { IMAGE: ['img.jpg', 'img2.jpg'] }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: { IMAGE: ['img.jpg', 'img2.jpg'] },
          images: ['img.jpg', 'img2.jpg'],
          sounds: [],
          music: []
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg', 'img2.jpg'],
        sounds: [],
        music: []
      });
    });

    test('multiple images in different paragraphs', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: { IMAGE: ['img.jpg', 'img2.jpg'] }
        }, {
          text: 'bbb',
          tags: { IMAGE: 'img3.jpg' }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: { IMAGE: ['img.jpg', 'img2.jpg'] },
          images: ['img.jpg', 'img2.jpg'],
          sounds: [],
          music: []
        }, {
          text: 'bbb',
          tags: { IMAGE: 'img3.jpg' },
          images: ['img3.jpg'],
          sounds: [],
          music: []
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg', 'img2.jpg', 'img3.jpg'],
        sounds: [],
        music: []
      });
    });
  });

  describe('sound and music tags', () => {
    test('single sound', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: { AUDIO: 'sound.mp3', AUDIOLOOP: 'music.mp3' }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: { AUDIO: 'sound.mp3', AUDIOLOOP: 'music.mp3' },
          images: [],
          sounds: ['sound.mp3'],
          music: ['music.mp3']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: [],
        sounds: ['sound.mp3'],
        music: ['music.mp3']
      });
    });

    test('multiple sounds and music', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: {
            PLAY_SOUND: ['sound1.mp3', 'sound2.mp3'],
            PLAY_MUSIC: ['music1.mp3', 'music2.mp3']
          }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: {
            PLAY_SOUND: ['sound1.mp3', 'sound2.mp3'],
            PLAY_MUSIC: ['music1.mp3', 'music2.mp3']
          },
          images: [],
          sounds: ['sound1.mp3', 'sound2.mp3'],
          music: ['music1.mp3', 'music2.mp3']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: [],
        sounds: ['sound1.mp3', 'sound2.mp3'],
        music: ['music1.mp3', 'music2.mp3']
      });
    });

    test('multiple images and music in different paragraphs', () => {
      const scene = {
        content: [{
          text: 'aaa',
          tags: {
            AUDIO: ['sound1.mp3', 'sound2.mp3'],
            AUDIOLOOP: 'music1.mp3'
          }
        }, {
          text: 'bbb',
          tags: {
            AUDIO: 'audio.mp3',
            PLAY_SOUND: 'sound3.mp3',
            PLAY_MUSIC: ['music2.mp3', 'music3.mp3']
          }
        }],
        text: ['aaaa'],
        tags: {},
        choices: []
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: {
            AUDIO: ['sound1.mp3', 'sound2.mp3'],
            AUDIOLOOP: 'music1.mp3'
          },
          images: [],
          sounds: ['sound1.mp3', 'sound2.mp3'],
          music: ['music1.mp3']
        }, {
          text: 'bbb',
          tags: {
            AUDIO: 'audio.mp3',
            PLAY_SOUND: 'sound3.mp3',
            PLAY_MUSIC: ['music2.mp3', 'music3.mp3']
          },
          images: [],
          sounds: ['audio.mp3', 'sound3.mp3'],
          music: ['music2.mp3', 'music3.mp3']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: [],
        sounds: ['sound1.mp3', 'sound2.mp3', 'audio.mp3', 'sound3.mp3'],
        music: ['music1.mp3', 'music2.mp3', 'music3.mp3']
      });
    });
  });

  describe('disabled choices', () => {
    function testChoiceTag(choiceTag) {
      const scene = {
        content: [{
          text: 'aaa',
          tags: {}
        }],
        text: ['aaaa'],
        tags: {},
        choices: [{
          id: 1,
          choice: 'ccc',
          tags: { [choiceTag]: true }
        }]
      };
      internalSceneProcessors.forEach((p) => p(scene));
      expect(scene).toEqual({
        content: [{
          text: 'aaa',
          tags: {},
          images: [],
          sounds: [],
          music: []
        }],
        text: ['aaaa'],
        tags: {},
        choices: [{
          id: 1,
          choice: 'ccc',
          tags: { [choiceTag]: true },
          disabled: true
        }],
        images: [],
        sounds: [],
        music: []
      });
    }

    test('UNCLICKABLE', () => {
      testChoiceTag('UNCLICKABLE');
    });

    test('DISABLED', () => {
      testChoiceTag('DISABLED');
    });

    test('INACTIVE', () => {
      testChoiceTag('INACTIVE');
    });
  });
});
