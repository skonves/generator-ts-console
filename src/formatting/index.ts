import * as Generator from 'yeoman-generator';

import { options as prettierrc } from './prettierrc';

module.exports = class extends Generator {
  configuring() {
    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);
  }

  install() {
    this.npmInstall('prettier', { 'save-dev': true });
  }
};
