/* eslint-env jest */
import getAssetPath from '../../src/components/assetpath';
import { interfaces } from '../../src/utils/interfaces';

const filePath = '/path/to';

const mockGetState = jest.fn(() => ({
  game: {
    $path: filePath
  }
}));

jest.mock('../../src/utils/interfaces', () => ({
  interfaces: jest.fn(() => ({
    state: {
      get: mockGetState
    }
  }))
}));


describe('components/assetpath', () => {
  test('return asset path', () => {
    expect(interfaces).not.toHaveBeenCalled();
    expect(mockGetState).not.toHaveBeenCalled();
    const assetPath = getAssetPath('file.ink.json');
    expect(interfaces).toHaveBeenCalledTimes(1);
    expect(mockGetState).toHaveBeenCalledTimes(1);
    expect(assetPath).toBe('/path/to/file.ink.json');
  });
});
