import * as helpers from 'yeoman-test';
import * as assert from 'yeoman-assert';

import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as rimraf from 'rimraf';

import { choices } from './index';

let tempdir: string;

type Choices = typeof choices;

type Answers = {
  [K in keyof Choices]: Choices[K][keyof Choices[K]];
};

describe('ts-console:app', function() {
  this.timeout(60000); // tslint:disable-line
  this.slow(30000); // tslint:disable-line

  let answers: Answers;

  beforeEach(done => {
    fs.mkdtemp(
      path.join(os.tmpdir(), 'generator-ts-console-tests-'),
      (err, folder) => {
        if (err) throw err;
        tempdir = folder;
        done();
      },
    );

    answers = {
      ci: 'GitHub Action',
      code: 'Example code and tests',
      testLib: 'Jest',
    };
  });

  afterEach(done => {
    rimraf(tempdir, () => done());
  });

  describe('ci prompt', () => {
    it('creates a .travis.yml file if travis is selected', async () => {
      // ARRANGE
      answers.ci = 'Travis CI (travis-ci.org)';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts(answers)
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, '.travis.yml'));
    });

    it('creates a GitHub workflow file if GitHub is selected', async () => {
      // ARRANGE
      answers.ci = 'GitHub Action';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts(answers)
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
      answers.code = 'Example code and tests';
      answers.testLib = 'Jest';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts(answers)
        .inDir(tempdir);

      // ASSERT
      assert.file(path.join(tempdir, 'src', 'index.ts'));
      assert.file(path.join(tempdir, 'src', 'index.tests.ts'));
    });

    it('does not create an index.ts file with tests when "Empty project only"', async () => {
      // ARRANGE
      answers.code = 'Empty project only';
      answers.testLib = 'Jest';

      // ACT
      await helpers
        .run(__dirname)
        .withPrompts(answers)
        .inDir(tempdir);

      // ASSERT
      assert.noFile(path.join(tempdir, 'src', 'index.ts'));
      assert.noFile(path.join(tempdir, 'src', 'index.tests.ts'));
    });
  });

  describe('defaults', () => {
    it('genererates a valid application', async () => {
      // ARRANGE
      const vscode = false;
      const skipInstall = false;

      // ACT
      console.log(`testing in ${tempdir}`);
      await helpers
        .run(__dirname)
        .withOptions({ vscode, skipInstall })
        .withPrompts(answers)
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
