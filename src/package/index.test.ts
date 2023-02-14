import * as path from 'path';

import * as helpers from 'yeoman-test';

describe('ts-core:npm', function () {
  let runResult: helpers.RunResult;

  beforeAll(async () => {
    runResult = await helpers.run(path.join(__dirname, '../package'));
  });

  it('creates a package.json file', async () => {
    runResult.assertFile('package.json');
  });

  it('creates a README.md file', async () => {
    runResult.assertFile('README.md');
  });
});
