import * as Generator from 'yeoman-generator';
import { addScripts, appendIgnore, deps } from '../utils';

export default class extends Generator {
  async configuring() {
    addScripts(this.fs, this.destinationPath('package.json'), {
      'lint:eslint': 'eslint src/**/*.*',
      'fix:eslint': 'eslint --fix src/**/*.*',
    });

    appendIgnore(
      this.fs,
      this.destinationPath('.eslintignore'),
      this.fs.read(this.templatePath('.eslintignore.template')),
      this.config.getPath('typescript.outDir') || 'lib',
    );

    this.fs.extendJSON(
      this.destinationPath('.eslintrc.json'),
      this.fs.readJSON(this.templatePath('.eslintrc.json.template')),
    );

    this.fs.extendJSON(
      this.destinationPath('tsconfig.eslint.json'),
      this.fs.readJSON(this.templatePath('tsconfig.eslint.json.template')),
    );

    this.fs.extendJSON(this.destinationPath('package.json'), {
      devDependencies: await deps(
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-import',
      ),
    });
  }
}
