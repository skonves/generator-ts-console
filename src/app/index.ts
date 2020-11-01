import * as Generator from 'yeoman-generator';
import { createState } from '../utils';

module.exports = class extends Generator {
  private state = createState();

  initializing() {
    this._with('../git');
    this._with('../npm');
    this._with('../typescript');
    this._with('../linter');
    this._with('../formatting');
    this._with('../testing');
    this._with('../ci');
  }

  async prompting() {
    const mode =
      this.options.mode ||
      (
        await this.prompt([
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
        ])
      ).mode;

    const basic = mode === 'basic';

    const { typescript, linter, testing, ci, license } = this.options;

    this.state.typescript = typescript || (basic ? 'latest' : undefined);
    this.state.linter = linter || (basic ? 'eslint' : undefined);
    this.state.testing = testing || (basic ? 'jest' : undefined);
    this.state.ci = ci || (basic ? 'github' : undefined);

    const licenseOptions =
      license ||
      (basic
        ? {
            name: '',
            email: '',
            website: '',
            license: 'UNLICENSED',
          }
        : {
            defaultLicense: 'MIT',
          });

    this.composeWith(require.resolve('generator-license'), licenseOptions);
  }

  private _with(namespace: string, arg?: string) {
    this.composeWith(
      require.resolve(namespace),
      arg ? { arguments: [arg] } : {},
    );
  }
};
