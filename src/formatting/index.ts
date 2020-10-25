import * as Generator from 'yeoman-generator';

module.exports = class extends Generator {
  configuring() {
    this.fs.copy(
      this.templatePath('.prettierrc.template'),
      this.destinationPath('.prettierrc'),
    );
  }

  install() {
    this.npmInstall('prettier', { 'save-dev': true });
  }
};
