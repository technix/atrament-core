/* eslint-env jest */
import mockConsole from 'jest-mock-console'; /* eslint-disable-line */
import { parseTags } from '../../src/utils/tags';

describe('utils/tags', () => {
  test('no tags', () => {
    const tags = parseTags();
    expect(tags).toEqual({});
  });

  test('simple tags', () => {
    const tags = parseTags(['HELLO', 'WORLD']);
    expect(tags).toEqual({
      HELLO: true,
      WORLD: true
    });
  });

  test('parameterized tags', () => {
    const tags = parseTags(['TAG1: named', 'TAG2: config:string']);
    expect(tags).toEqual({
      TAG1: 'named',
      TAG2: 'config:string'
    });
  });

  test('parameterized tags - boolean', () => {
    const tags = parseTags(['TAG1: true', 'TAG2: false']);
    expect(tags).toEqual({
      TAG1: true,
      TAG2: false
    });
  });

  test('parameterized tags - strings', () => {
    const tags = parseTags(['TAG1: "true"', 'TAG2: "false"']);
    expect(tags).toEqual({
      TAG1: 'true',
      TAG2: 'false'
    });
  });

  test('JSON tags', () => {
    const tags = parseTags(['JSONOBJECT: {"key":"value"}', 'JSONARRAY: ["hello", "world"]']);
    expect(tags).toEqual({
      JSONOBJECT: { key: 'value' },
      JSONARRAY: ['hello', 'world']
    });
  });

  test('JSON tags - ignore invalid JSON', () => {
    const restoreConsole = mockConsole();
    const tags = parseTags(['JSONOBJECT: {"key":}', 'JSONARRAY: ["hello", "world"', 'VALIDJSON: {"key":"value"}']);
    expect(tags).toEqual({
      VALIDJSON: { key: 'value' }
    });
    restoreConsole();
  });

  test('multiple tags', () => {
    const tags = parseTags(['title: Game Title', 'observe: var1', 'observe: var2', 'observe: var3']);
    expect(tags).toEqual({
      title: 'Game Title',
      observe: ['var1', 'var2', 'var3']
    });
  });

  test('combined', () => {
    const restoreConsole = mockConsole();
    const tags = parseTags([
      'HELLO',
      'BOOLEANTAG: false',
      'MALFORMEDJSONARRAY: ["hello", "world"',
      'title: Game Title',
      'JSONARRAY: ["hello", "world"]',
      'observe: var1',
      'MALFORMEDJSONOBJECT: {"key":}',
      'WORLD',
      'observe: var2',
      'JSONOBJECT: {"key":"value"}',
      'observe: var3'
    ]);
    expect(tags).toEqual({
      HELLO: true,
      WORLD: true,
      BOOLEANTAG: false,
      JSONOBJECT: { key: 'value' },
      JSONARRAY: ['hello', 'world'],
      title: 'Game Title',
      observe: ['var1', 'var2', 'var3']
    });
    restoreConsole();
  });
});
