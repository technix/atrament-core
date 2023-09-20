/* eslint-env jest */
import { getConfig, setConfig } from '../../src/utils/config';

const defaultConfig = {
  applicationID: '!CHANGE_THIS',
  settings: {
    volume: 0,
    mute: true
  }
};

const Story = () => ({ inkStoryConstructor: true });

afterAll(() => setConfig(Story, defaultConfig));

describe('utils/config', () => {
  test('no params', () => {
    expect(() => {
      setConfig();
    }).toThrow('atrament.init: provide ink Story constructor as a first argument!');
  });

  test('returns valid config', () => {
    const cfg = getConfig();
    expect(cfg).toEqual(defaultConfig);
  });

  test('no config provided', () => {
    setConfig(Story);
    const cfg = getConfig();
    expect(cfg).toEqual(defaultConfig);
  });

  test('no valid Story constructor provided', () => {
    expect(() => {
      setConfig({ some: 'config' });
    }).toThrow('atrament.init: Story is not a constructor!');
  });

  test('sets config', () => {
    setConfig(Story, {
      applicationID: 'jest-test',
      settings: {
        fullscreen: true
      }
    });
    const cfg = getConfig();
    expect(cfg).toEqual({
      applicationID: 'jest-test',
      InkStory: Story,
      settings: {
        fullscreen: true
      }
    });
  });
});
