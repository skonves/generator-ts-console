import * as Generator from 'yeoman-generator';

module.exports = class extends Generator {
  initializing() {
    this._with('../git');
    this._with('../npm');
  }

  async prompting() {
    const mode =
      this.options.mode ||
      (await this.prompt([
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
      ])).mode;

    const basic = mode === 'basic';

    const typescriptArg =
      this.options.typescript || (basic ? 'latest' : undefined);
    const linterArg = this.options.linter || (basic ? 'eslint' : undefined);
    const testingArg = this.options.testing || (basic ? 'jest' : undefined);
    const ciArg = this.options.ci || (basic ? 'github' : undefined);

    const licenseOptions =
      this.options.license ||
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

    this._with('../typescript', typescriptArg);
    this._with('../linter', linterArg);
    this._with('../formatting');
    this._with('../testing', testingArg);
    this._with('../ci', ciArg);
    this.composeWith(require.resolve('generator-license'), licenseOptions);
  }

  private _with(namespace: string, arg?: string) {
    this.composeWith(
      require.resolve(namespace),
      arg ? { arguments: [arg] } : {},
    );
  }
};
