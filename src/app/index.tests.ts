import * as helpers from 'yeoman-test';
import * as assert from 'yeoman-assert';

import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as rimraf from 'rimraf';

let tempdir: string;

describe('ts-console:app', function() {
  this.timeout(60000); // tslint:disable-line
  this.slow(30000); // tslint:disable-line

  beforeEach(done => {
    fs.mkdtemp(
      path.join(os.tmpdir(), 'generator-ts-console-tests-'),
      (err, folder) => {
        if (err) throw err;
        tempdir = folder;
        done();
      },
    );
  });

  afterEach(done => {
    rimraf(tempdir, () => done());
  });

  describe('ci prompt', () => {
    it('creates a .travis.yml file if travis is selected', async () => {
      // ARRANGE
      const ci = 'Travis CI (travis-ci.org)';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts({ ci })
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, '.travis.yml'));
    });

    it('creates a GitHub workflow file if GitHub is selected', async () => {
      // ARRANGE
      const ci = 'GitHub Action';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts({ ci })
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, '.github', 'workflows', 'build.yml'));
    });

    it('does not create a .travis.yml file if no input is selected', async () => {
      // ARRANGE

      // ACT
      await helpers.run(__dirname).inDir(tempdir);

      // ASSERT
      assert.noFile(path.join(tempdir, '.travis.yml'));
    });
  });

  describe('vscode option', () => {
    it('creates a .vscode config folder when true', async () => {
      // ARRANGE
      const vscode = true;

      // ACT
      await helpers
        .run(__dirname)
        .withOptions({ vscode })
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, '.vscode', 'launch.json'));
    });

    it('does not create a .vscode config folder when false', async () => {
      // ARRANGE
      const vscode = false;

      // ACT
      await helpers
        .run(__dirname)
        .withOptions({ vscode })
        .inDir(tempdir);

      // ASSERT
      assert.noFile(path.join(tempdir, '.vscode', 'launch.json'));
    });

    it('does not create a .vscode config folder when not provided', async () => {
      // ARRANGE

      // ACT
      await helpers.run(__dirname).inDir(tempdir);

      // ASSERT
      assert.noFile(path.join(tempdir, '.vscode', 'launch.json'));
    });
  });

  describe('code prompt', () => {
    it('creates an index.ts file with tests when "Example code and tests"', async () => {
      // ARRANGE
      const code = 'Example code and tests';
      const testLib = 'Jest';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts({ code, testLib })
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, 'src', 'index.ts'));
      assert.file(path.join(tempdir, 'src', 'index.tests.ts'));
    });

    it('does not create an index.ts file with tests when "Empty project only"', async () => {
      // ARRANGE
      const code = 'Empty project only';
      const testLib = 'Jest';

      // ACT
      await helpers
        .run(__dirname)
        .withOptions({ code, testLib })
        .inDir(tempdir);

      // ASSERT
      assert.noFile(path.join(tempdir, 'src', 'index.ts'));
      assert.noFile(path.join(tempdir, 'src', 'index.tests.ts'));
    });
  });

  describe('defaults', () => {
    it('genererates a valid application', async () => {
      // ARRANGE
      const code = 'Example code and tests';
      const testLib = 'Jest';
      const vscode = false;
      const skipInstall = false;

      // ACT
      console.log(`testing in ${tempdir}`);
      await helpers
        .run(__dirname)
        .withOptions({ vscode, skipInstall })
        .withPrompts({ code, testLib })
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, 'src', 'index.ts'));
      assert.file(path.join(tempdir, 'src', 'index.tests.ts'));
      assert.noFile(path.join(tempdir, '.vscode', 'launch.json'));

      await new Promise((resolve, reject) => {
        exec('npm run build', { cwd: tempdir }, err =>
          !!err ? reject(err) : resolve(),
        );
      });

      await new Promise((resolve, reject) => {
        exec('npm t', { cwd: tempdir }, err =>
          !!err ? reject(err) : resolve(),
        );
      });
    });
  });
});
