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

    if (answers.mode === 'basic') {
      typescriptArgs.push('latest');
      linterArgs.push('tslint');
      testingArgs.push('jest');
      ciArgs.push('github');
    }

    this._with('../typescript', typescriptArgs);
    this._with('../linter', linterArgs);
    this._with('../formatting');
    this._with('../testing', testingArgs);
    this._with('../ci', ciArgs);
  }

  private _with(namespace: string, args?: string[]) {
    this.composeWith(
      require.resolve(namespace),
      args && args.length ? { arguments: args } : {},
    );
  }
};
