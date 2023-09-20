/* eslint-env jest */
import atrament from '../src/index';
import packageInfo from '../package.json';


describe('atrament', () => {
  test('returns valid version', () => {
    const atramentVersion = atrament.version;
    expect(atramentVersion).toEqual(packageInfo.version);
  });
});
