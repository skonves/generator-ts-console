import * as assert from 'yeoman-assert';
import { TestContext } from '../utils';

import { tslintScript } from './index';

const sut = new TestContext(__dirname);

let prompts: Record<string, string>;
let args: string[];

describe('ts-console:linter', function() {
  this.timeout(5000); // tslint:disable-line
  this.slow(2000); // tslint:disable-line

  beforeEach(async () => {
    await sut.setup();
    sut.withFile('package.json', '{}');
  });
  afterEach(async () => await sut.teardown());

  context('when "tslint" is selected at prompt', () => {
    beforeEach(() => {
      prompts = { linter: 'tslint' };
    });

    it('creates a tslint config file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('tslint.json'));
      assert.file(sut.join('package.json'));
    });

    it('creates a lint script', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.jsonFileContent(sut.join('package.json'), {
        scripts: { lint: tslintScript },
      });
    });
  });

  context('when "tslint" is passed as an argument', () => {
    beforeEach(() => {
      args = ['tslint'];
    });

    it('creates a tslint config file', async () => {
      // ACT
      await sut.run().withPrompts(prompts);

      // ASSERT
      assert.file(sut.join('tslint.json'));
    });
  });
});
