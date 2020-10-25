import * as assert from 'yeoman-assert';
import { TestContext } from '../utils';
import { githubBadgeRegex } from './index';

const sut = new TestContext(__dirname);

let prompts: Record<string, string>;
let args: string[];

describe('ts-console:ci', function() {
  this.timeout(5000); // tslint:disable-line
  this.slow(2000); // tslint:disable-line

  beforeEach(async () => await sut.setup());
  afterEach(async () => await sut.teardown());

  context('when "github" is selected at prompt', () => {
    beforeEach(() => {
      prompts = { ci: 'github' };
    });

    it('creates a GitHub Actions workflow', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('.github', 'workflows', 'build.yml'));
    });

    it('does not create a .travis.yml file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.noFile(sut.join('.travis.yml'));
    });

    context('when a README exists', () => {
      beforeEach(() => {
        sut.withFile('README.md', '');
      });

      it('adds a badge to the README', async () => {
        // ACT
        await sut.run().withPrompts(prompts);

        // ASSERT
        assert.file(sut.join('README.md'));
        assert.fileContent(sut.join('README.md'), githubBadgeRegex);
      });
    });

    context('when a README does not exist', () => {
      it('ingores the missing README', async () => {
        // ACT
        await sut.run().withPrompts(prompts);

        // ASSERT
        assert.noFile(sut.join('README.md'));
      });
    });
  });

  context('when "github" is passed as an argument', () => {
    beforeEach(() => {
      args = ['github'];
    });

    it('creates a GitHub Actions workflow', async () => {
      // ACT
      await sut.run().withArguments(args);

      // ASSERT
      assert.file(sut.join('.github', 'workflows', 'build.yml'));
    });
  });

  context('when "travis" is selected at prompt', () => {
    beforeEach(() => {
      prompts = { ci: 'travis' };
    });

    it('creates a .travis.yml file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('.travis.yml'));
    });

    it('does not create a GitHub Actions workflow', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.noFile(sut.join('.github', 'workflows', 'build.yml'));
    });
  });

  context('when "travis" is passed as an argument', () => {
    beforeEach(() => {
      args = ['travis'];
    });

    it('creates a .travis.yml file', async () => {
      // ACT
      await sut.run().withArguments(args);

      // ASSERT
      assert.file(sut.join('.travis.yml'));
    });
  });
});
