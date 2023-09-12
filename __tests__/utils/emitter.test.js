/* eslint-env jest */
import { emitter, emit } from '../../src/utils/emitter';

describe('utils/emitter', () => {
  test('subscribe, emit, unsubscribe', () => {
    const eventHandler = jest.fn();

    emit('event', 'eventParameter');
    expect(eventHandler).toBeCalledTimes(0);

    emitter.on('event', eventHandler);
    emit('event', 'eventParameter');
    expect(eventHandler).toBeCalledTimes(1);
    expect(eventHandler).toBeCalledWith('eventParameter');
    eventHandler.mockClear();

    emit('event', { key: 'value' });
    expect(eventHandler).toBeCalledTimes(1);
    expect(eventHandler).toBeCalledWith({ key: 'value' });
    eventHandler.mockClear();

    emitter.off('event', eventHandler);
    emit('event', 'eventParameter');
    expect(eventHandler).toBeCalledTimes(0);
    eventHandler.mockClear();
  });
});
