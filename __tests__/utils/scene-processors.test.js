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
          images: ['img.jpg']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg']
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
          images: ['img.jpg', 'img2.jpg']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg', 'img2.jpg']
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
          images: ['img.jpg', 'img2.jpg']
        }, {
          text: 'bbb',
          tags: { IMAGE: 'img3.jpg' },
          images: ['img3.jpg']
        }],
        text: ['aaaa'],
        tags: {},
        choices: [],
        images: ['img.jpg', 'img2.jpg', 'img3.jpg']
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
          images: []
        }],
        text: ['aaaa'],
        tags: {},
        choices: [{
          id: 1,
          choice: 'ccc',
          tags: { [choiceTag]: true },
          disabled: true
        }],
        images: []
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
