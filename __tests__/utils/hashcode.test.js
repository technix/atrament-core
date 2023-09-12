/* eslint-env jest */
import hashCode from '../../src/utils/hashcode';

describe('utils/hashcode', () => {
  test('returns valid hash', () => {
    const hashed = hashCode('test/string');
    expect(hashed).toBe(108729390);
    const hashed2 = hashCode('test/anotherstring');
    expect(hashed2).not.toBe(hashed);
  });
});
