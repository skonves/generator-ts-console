import * as Generator from 'yeoman-generator';
import { getNodeGitIgnore } from './network';

module.exports = class extends Generator {
  async configuring() {
    this.fs.write('.gitignore', await getNodeGitIgnore());
  }
};
