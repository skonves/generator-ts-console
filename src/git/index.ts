import * as Generator from 'yeoman-generator';
import { getNodeGitIgnore } from './network';

export default class extends Generator {
  async configuring() {
    this.fs.write(this.destinationPath('.gitignore'), await getNodeGitIgnore());

    this.fs.append(
      this.destinationPath('.gitignore'),
      this.config.getPath('typescript.outDir'),
    );

    this.fs.append(this.destinationPath('.gitignore'), '');
  }
}
