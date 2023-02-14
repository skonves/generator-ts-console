import * as Generator from 'yeoman-generator';
import { addScripts, deps } from '../utils';

import { options as prettierrc } from './prettierrc';

export default class extends Generator {
  async configuring() {
    const outDir: string = this.config.getPath('typescript.outDir') || 'lib';

    this.fs.extendJSON(this.destinationPath('.prettierrc'), prettierrc);

    this.fs.copyTpl(
      this.templatePath('.prettierignore.template'),
      this.destinationPath('.prettierignore'),
    );

    this.fs.append(this.destinationPath('.prettierignore'), outDir);
    this.fs.append(this.destinationPath('.prettierignore'), '');

    addScripts(this.fs, this.destinationPath('package.json'), {
      'lint:prettier': 'prettier -c .',
      'fix:prettier': 'prettier -w .',
    });

    this.fs.extendJSON(this.destinationPath('package.json'), {
      devDependencies: await deps('prettier'),
    });
  }
}
