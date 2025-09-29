/* eslint-env jest */
import { emitter, emit } from '../../src/utils/emitter';

describe('utils/emitter', () => {
  test('subscribe, emit, unsubscribe', () => {
    const eventHandler = jest.fn();

    emit('event', 'eventParameter');
    expect(eventHandler).toHaveBeenCalledTimes(0);

    emitter.on('event', eventHandler);
    emit('event', 'eventParameter');
    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(eventHandler).toHaveBeenCalledWith('eventParameter');
    eventHandler.mockClear();

    emit('event', { key: 'value' });
    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(eventHandler).toHaveBeenCalledWith({ key: 'value' });
    eventHandler.mockClear();

    emitter.off('event', eventHandler);
    emit('event', 'eventParameter');
    expect(eventHandler).toHaveBeenCalledTimes(0);
    eventHandler.mockClear();
  });
});
