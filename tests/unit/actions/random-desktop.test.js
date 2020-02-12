jest.mock('caporal/lib/logger');
import fs from 'fs';
import path from 'path';
import wallpaper from 'wallpaper';
import chalk from 'chalk';
import logger from 'caporal/lib/logger';
import {
  IMAGE_NAME_FORMAT_HASH,
  ORIENTATION_ALL,
  ORIENTATION_LANDSCAPE,
  PATH_TO_CONFIG
} from '../../../source/constants';
import getImages from '../../../source/actions/get-images';
import randomDesktop from '../../../source/actions/random-desktop';
import deleteFolderRecursive from '../../mock-data/delete-folder-recursive';

let infoRecord = '';
let warnRecord = '';
let errorRecord = '';

const mockLogger = logger.createLogger.mockImplementation(() => {
  return {
    info: jest.fn(
      function (data) {
        infoRecord += data;
      }
    ),
    warn: jest.fn(
      function (data) {
        warnRecord += data;
      }
    ),
    error: jest.fn(
      function (data) {
        errorRecord += data;
      }
    )
  }
});

describe('Action - Function random-desktop', () => {
  // Reset logging recorder
  beforeEach(() => {
    infoRecord = '';
    warnRecord = '';
  });
  // Run test inside build folder
  // Remove user settings to avoid side effect on other test cases
  afterEach(() => {
    if (fs.existsSync(path.join(process.cwd(), '\\.userconfig'))) {
      fs.unlinkSync(path.join(process.cwd(), '\\.userconfig'));
    }
    deleteFolderRecursive('D:/w10-startup-lock-screen-extractor/');
  });

  it('Should be able to set new desktop wallpaper after successfully get images ', async () => {
    const folder = `D:/w10-startup-lock-screen-extractor/${Math.floor(Math.random() * Math.floor(10000))}/`;
    const logger = mockLogger();
    await getImages({}, {
      path: folder,
      orientation: ORIENTATION_LANDSCAPE,
      namePattern: IMAGE_NAME_FORMAT_HASH
    }, logger);
    await randomDesktop({}, {}, logger);
    const images = fs.readdirSync(folder);
    const wallpaperName = path.basename(await wallpaper.get());
    // Expect images exists images folder
    // And it display success message
    expect(images.includes(wallpaperName)).toBeTruthy();
    expect(infoRecord.includes('New desktop background has been set')).toBeTruthy();
  });

  it('Should display “No existing images…“ when image folder does not exist', async () => {
    const logger = mockLogger();
    // Mock an empty .userconfig file, which should be containing path to image folder
    fs.writeFileSync(PATH_TO_CONFIG, '');
    await randomDesktop({}, {}, logger);
    expect(infoRecord).toEqual(chalk.cyan('\nStart processing'));
    expect(warnRecord).toEqual(chalk.yellow('\nNo existing images, try getting the images first, run "get-lock-screen -h" for usage'));
  });

  it('Should display “No existing images…“ when found no image to use', async () => {
    const folder = `D:/w10-startup-lock-screen-extractor/${Math.floor(Math.random() * Math.floor(10000))}/`;
    const logger = mockLogger();
    // Mock an empty .userconfig file, which should be containing path to image folder
    fs.writeFileSync(PATH_TO_CONFIG, folder);
    await randomDesktop({}, {}, logger);
    expect(warnRecord).toEqual(chalk.yellow('\nNo existing images, try getting the images first, run "get-lock-screen -h" for usage'));
  });

  it('Should display “Unexpected errors…“ when fail to set wallpaper for some reasons', async () => {
    // Mock process.argv to bypass prompt which leads to timeOut
    const logger = mockLogger();
    const oldProcessArgv = process.argv;
    process.argv = [ ...oldProcessArgv, '', ''];
    await getImages({}, { }, logger);
    // Mock error while retrieving setWallpaper binary
    const old = fs.writeFileSync;
    fs.writeFileSync = jest.fn(function mock() {
      throw 'Unexpected Error'
    });
    await randomDesktop({}, {}, logger);
    // Mock an empty .userconfig file, which should be containing path to image folder
    expect(warnRecord).toEqual(chalk.yellow('\nUnexpected errors!'));
    fs.writeFileSync = old;
    process.argv = oldProcessArgv;
  });
});
