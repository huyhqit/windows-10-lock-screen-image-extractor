const getFiles = require('../../../source/helpers/get-files');
const normalizePath = require('../../../source/helpers/normalize-path');

describe('Helper - Function is-image', () => {
  it('Should return an array of file meta objects', () => {
    // Try using getFiles to extract file meta from mock-assets folders
    const path = `${process.cwd()}/tests/mock-assets`;
    const metaObjects = getFiles(path);

    // Check for correct path
    const check = metaObjects.every(object => {
      return (
        Object.prototype.hasOwnProperty.call(object, 'name') &&
        Object.prototype.hasOwnProperty.call(object, 'path') &&
        object.path === normalizePath(path)
      );
    });
    expect(check).toBe(true);

    // Check for false path
    const falsePath = `${process.cwd()}/tests/mock-assets/falseFolder`;
    expect(getFiles(falsePath)).toEqual([]);
  });
});
