import * as Generator from 'yeoman-generator';
import { append } from '../utils';
import { getNodeGitIgnore } from './network';

module.exports = class extends Generator {
  async configuring() {
    this.fs.write(this.destinationPath('.gitignore'), await getNodeGitIgnore());

    append(this.fs, this.destinationPath('.gitignore'), 'lib');
  }
};
