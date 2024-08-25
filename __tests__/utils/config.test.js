/* eslint-env jest */
import { getConfig, setConfig } from '../../src/utils/config';

const defaultConfig = {
  settings: {
    volume: 0,
    mute: true
  }
};

const Story = () => ({ inkStoryConstructor: true });

afterAll(() => setConfig(Story, { ...defaultConfig, applicationID: 'jest-test' }));

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

  test('no valid Story constructor provided', () => {
    expect(() => {
      setConfig({ some: 'config' });
    }).toThrow('atrament.init: Story is not a constructor!');
  });

  test('no config provided', () => {
    expect(() => setConfig(Story)).toThrow('atrament.init: config.applicationID is not set!');
  });

  test('config without applicationID', () => {
    expect(
      () => setConfig(Story, { settings: { mute: true } })
    ).toThrow('atrament.init: config.applicationID is not set!');
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
