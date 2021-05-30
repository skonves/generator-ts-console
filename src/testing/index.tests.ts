import * as assert from 'yeoman-assert';
import { TestContext } from '../test-utils';

import { jestScript, mochaScript } from './index';

const sut = new TestContext(__dirname);

let prompts: Record<string, string>;
let args: string[];

describe('ts-console:testing', function () {
  beforeEach(async () => await sut.setup());
  afterEach(async () => await sut.teardown());

  describe('when "jest" is selected at prompt', () => {
    beforeEach(() => {
      prompts = { testing: 'jest' };
    });

    it('creates a jest config file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file('jest.config.json');
      assert.noFile('.nycrc');
    });

    it('sets the correct test script', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.jsonFileContent('package.json', { scripts: { test: jestScript } });
    });

    it('creates an example code file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('src', 'index.ts'));
    });

    it('creates a test file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('src', 'index.tests.ts'));
      assert.fileContent(sut.join('src', 'index.tests.ts'), '.toEqual(');
      assert.noFileContent(
        sut.join('src', 'index.tests.ts'),
        "import { expect } from 'chai';",
      );
      assert.noFileContent(sut.join('src', 'index.tests.ts'), '.to.be.equal(');
    });
  });

  describe('when "mocha" is selected at prompt', () => {
    beforeEach(() => {
      prompts = { testing: 'mocha' };
    });

    it('creates a mocha config file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file('.nycrc');
      assert.noFile('jest.config.json');
    });

    it('sets the correct test script', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.jsonFileContent('package.json', {
        scripts: { test: mochaScript },
      });
    });

    it('creates an example code file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('src', 'index.ts'));
    });

    it('creates a test file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('src', 'index.tests.ts'));
      assert.fileContent(sut.join('src', 'index.tests.ts'), '.to.be.equal(');
      assert.fileContent(
        sut.join('src', 'index.tests.ts'),
        "import { expect } from 'chai';",
      );
      assert.noFileContent(sut.join('src', 'index.tests.ts'), '.toEqual(');
    });
  });

  describe('when "jest" is passed as an argument', () => {
    beforeEach(() => {
      args = ['jest'];
    });

    it('creates a jest config file', async () => {
      // ACT
      await sut.run().withArguments(args);

      // ASSERT
      assert.file('jest.config.json');
      assert.noFile('.nycrc');
    });
  });

  describe('when "mocha" is passed as an argument', () => {
    beforeEach(() => {
      args = ['mocha'];
    });

    it('creates a mocha config file', async () => {
      // ACT
      await sut.run().withArguments(args);

      // ASSERT
      assert.file('.nycrc');
      assert.noFile('jest.config.json');
    });
  });
});
