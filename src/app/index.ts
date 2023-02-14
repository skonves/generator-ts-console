import Generator = require('yeoman-generator');

import { PrettierTransform } from '../prettier-transform';

export default class extends Generator {
  constructor(args: string | string[], options: any) {
    super(args, options);

    this.queueTransformStream(new PrettierTransform());
    this._with('../package');
    this._with('../typescript');
    this._with('../style');
    this._with('../git');
    this._with('../ci');
    this._with('../linter');
    this._with('../tests');
  }

  prompting() {
    console.log('hello from generator-ts-core');

    this.composeWith(require.resolve('generator-license'), {
      defaultLicense: 'MIT',
    });
  }

  private _with(namespace: string) {
    this.composeWith(require.resolve(namespace), this.options);
  }
}
