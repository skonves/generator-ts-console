import * as Generator from 'yeoman-generator';
import { append } from '../utils';

import { options as prettierrc } from './prettierrc';

module.exports = class extends Generator {
  configuring() {
    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);

    append(
      this.fs,
      this.destinationPath('.prettierignore'),
      this.fs.read(this.templatePath('.prettierignore.template')),
    );

    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        'lint:prettier': 'prettier -c .',
        'fix:prettier': 'prettier -w .',
      },
    });
  }

  install() {
    this.npmInstall('prettier', { 'save-dev': true });
  }
};
