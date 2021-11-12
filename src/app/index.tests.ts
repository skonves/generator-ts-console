import { exec } from 'child_process';

import { TestContext } from '../test-utils';

const sut = new TestContext(__dirname);

const fiveMinutes = 5 * 60 * 1000;

describe('ts-console:app', function () {
  beforeEach(async () => await sut.setup());
  afterEach(async () => await sut.teardown());

  describe('when the "basic" mode is run', () => {
    jest.setTimeout(fiveMinutes);
    it('genererates a valid application', async () => {
      // ARRANGE

      // ACT
      await sut
        .run()
        .withOptions({ skipInstall: false })
        .withPrompts({ mode: 'basic' });

      // ASSERT
      await new Promise<void>((resolve, reject) => {
        exec('npm run build', { cwd: sut.tempdir }, (err) =>
          !!err ? reject(err) : resolve(),
        );
      });

      await new Promise<void>((resolve, reject) => {
        exec('npm t', { cwd: sut.tempdir }, (err) =>
          !!err ? reject(err) : resolve(),
        );
      });
    });
  });
});
