import * as Generator from 'yeoman-generator';
import { append, joinScript, splitScript } from '../utils';

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

    const { scripts } = this.fs.readJSON(this.destinationPath('package.json'));
    const lint = splitScript(scripts.lint);
    const lintFix = splitScript(scripts['lint:fix']);

    if (!lint.includes('prettier -c .')) {
      lint.push('prettier -c .');
    }

    if (!lintFix.includes('prettier -w .')) {
      lintFix.push('prettier -w .');
    }

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        lint: joinScript(lint),
        'lint:fix': joinScript(lintFix),
      },
    });
  }

  install() {
    this.npmInstall('prettier', { 'save-dev': true });
  }
};
