/* eslint-env jest */
import { getConfig, setConfig } from '../../src/utils/config';

const defaultConfig = {
  applicationID: '!CHANGE_THIS',
  settings: {
    volume: 0,
    mute: true
  }
};

afterAll(() => setConfig(null, defaultConfig));

describe('utils/config', () => {
  test('returns valid config', () => {
    const cfg = getConfig();
    expect(cfg).toEqual(defaultConfig);
  });

  test('no config provided', () => {
    const inkStory = 'inkStory';
    setConfig(inkStory);
    const cfg = getConfig();
    expect(cfg).toEqual(defaultConfig);
  });

  test('sets config', () => {
    const inkStory = 'inkStory';
    setConfig(inkStory, {
      applicationID: 'jest-test',
      settings: {
        fullscreen: true
      }
    });
    const cfg = getConfig();
    expect(cfg).toEqual({
      applicationID: 'jest-test',
      InkStory: 'inkStory',
      settings: {
        fullscreen: true
      }
    });
  });
});
