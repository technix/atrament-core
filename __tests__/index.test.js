/* eslint-env jest */
import atrament from '../src/index';

import packageInfo from '../package.json';
import { getConfig, setConfig } from '../src/utils/config';
import { emitter, emit } from '../src/utils/emitter';
import settings from '../src/components/settings';

const filePath = '/path/to';

const mockGetState = jest.fn(() => ({
  game: {
    $path: filePath
  }
}));

const mockStateStore = 'STORE';

const mockState = {
  get: mockGetState,
  store: jest.fn(() => mockStateStore)
};

const mockPersistent = {
  init: jest.fn()
};

jest.mock('../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: mockState,
    persistent: mockPersistent
  }))
}));

jest.mock('../src/components/settings', () => ({
  load: jest.fn(async () => 'LOAD')
}));

jest.mock('../src/utils/emitter', () => ({
  emit: jest.fn(),
  emitter: {
    on: jest.fn(),
    off: jest.fn()
  }
}));


beforeEach(() => {
  jest.clearAllMocks();
  setConfig(null, {});
});

describe('atrament', () => {
  test('returns valid version', () => {
    const atramentVersion = atrament.version;
    expect(atramentVersion).toEqual(packageInfo.version);
  });

  test('returns state', () => {
    const atramentState = atrament.state();
    expect(atramentState).toEqual(mockState);
  });

  test('returns store', () => {
    const atramentState = atrament.store();
    expect(atramentState).toEqual(mockStateStore);
  });

  test('subscribe/unsubscribe', () => {
    const callback = () => 'callback';
    expect(emitter.on).not.toHaveBeenCalled();
    atrament.on('event', callback);
    expect(emitter.on).toHaveBeenCalledWith('event', callback);
    expect(emitter.off).not.toHaveBeenCalled();
    atrament.off('event', callback);
    expect(emitter.off).toHaveBeenCalledWith('event', callback);
  });

  test('init', async () => {
    expect(emit).not.toHaveBeenCalled();
    expect(settings.load).not.toHaveBeenCalled();
    expect(mockPersistent.init).not.toHaveBeenCalled();
    expect(getConfig()).toEqual({
      InkStory: null,
      applicationID: '!CHANGE_THIS',
      settings: { mute: true, volume: 0 }
    });
    // run
    const Story = { inkStory: true };
    const cfg = { applicationID: 'TEST APP' };
    await atrament.init(Story, cfg);
    // check
    expect(getConfig()).toEqual({
      InkStory: Story,
      applicationID: cfg.applicationID,
      settings: { mute: true, volume: 0 }
    });
    expect(emit).toHaveBeenCalledWith('atrament/init');
    expect(mockPersistent.init).toHaveBeenCalledWith(cfg.applicationID);
    expect(settings.load).toHaveBeenCalledTimes(1);
  });
});
