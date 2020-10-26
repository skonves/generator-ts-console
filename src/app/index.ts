import * as os from 'os';

import * as Generator from 'yeoman-generator';

module.exports = class extends Generator {
  initializing() {
    this._with('../git');
    this._with('../npm');
  }

  async prompting() {
    const answers = await this.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Quick start',
        choices: [
          { name: 'Set it up for me', value: 'basic' },
          { name: 'Advanced options', value: 'advanced' },
        ],
        default: 0,
      },
    ]);

    const typescriptArgs = [];
    const linterArgs = [];
    const testingArgs = [];
    const ciArgs = [];
    let licenseOptions: any = {
      defaultLicense: 'MIT',
    };

    if (answers.mode === 'basic') {
      typescriptArgs.push('latest');
      linterArgs.push('eslint');
      testingArgs.push('jest');
      ciArgs.push('github');

      licenseOptions = {
        name: '',
        email: '',
        website: '',
        license: 'UNLICENSED',
      };
    }

    this._with('../typescript', typescriptArgs);
    this._with('../linter', linterArgs);
    this._with('../formatting');
    this._with('../testing', testingArgs);
    this._with('../ci', ciArgs);
    this.composeWith(require.resolve('generator-license'), licenseOptions);
  }

  private _with(namespace: string, args?: string[]) {
    this.composeWith(
      require.resolve(namespace),
      args && args.length ? { arguments: args } : {},
    );
  }
};
