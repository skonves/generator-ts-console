import { exec } from 'child_process';

import { TestContext } from '../utils';

const sut = new TestContext(__dirname);

describe('ts-console:app', function() {
  this.timeout(60000); // tslint:disable-line
  this.slow(30000); // tslint:disable-line

  beforeEach(async () => await sut.setup());
  afterEach(async () => await sut.teardown());

  context('when the "basic" mode is run', () => {
    it('genererates a valid application', async () => {
      // ARRANGE

      // ACT
      await sut
        .run()
        .withOptions({ skipInstall: false })
        .withPrompts({ mode: 'basic' });

      // ASSERT
      await new Promise((resolve, reject) => {
        exec('npm run build', { cwd: sut.tempdir }, err =>
          !!err ? reject(err) : resolve(),
        );
      });

      await new Promise((resolve, reject) => {
        exec('npm t', { cwd: sut.tempdir }, err =>
          !!err ? reject(err) : resolve(),
        );
      });
    });
  });
});
