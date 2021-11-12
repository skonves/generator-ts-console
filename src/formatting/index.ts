import * as Generator from 'yeoman-generator';
import { append, filterDev, ignore, ignores } from '../utils';

import { options as prettierrc } from './prettierrc';

module.exports = class extends Generator {
  configuring() {
    const tsconfig = this.fs.readJSON(this.destinationPath('tsconfig.json'));
    const outDir = tsconfig?.compilerOptions?.outDir;

    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);

    ignore(
      this.fs,
      this.destinationPath('.prettierignore'),
      this.fs.read(this.templatePath('.prettierignore.template')),
    );
    ignore(this.fs, this.destinationPath('.prettierignore'), outDir);

    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        'lint:prettier': 'prettier -c .',
        'fix:prettier': 'prettier -w .',
      },
    });
  }

  install() {
    this.npmInstall(
      filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
        'prettier',
      ]),
      { 'save-dev': true },
    );
  }
};
