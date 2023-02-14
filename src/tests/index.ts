import { join } from 'path';
import * as Generator from 'yeoman-generator';
import { addScripts, appendIgnore, deps } from '../utils';

export default class extends Generator {
  async configuring() {
    addScripts(this.fs, this.destinationPath('package.json'), {
      'clean:coverage': 'rimraf coverage',
      pretest: 'run-s -s clean',
      test: 'jest',
    });

    this.fs.extendJSON(
      this.destinationPath('jest.config.json.template'),
      this.fs.readJSON(this.templatePath('jest.config.json')),
    );

    this.fs.copy(
      this.templatePath(join('src', 'index.test.ts.template')),
      this.destinationPath(join('src', 'index.test.ts')),
    );

    // appendIgnore(
    //   this.fs,
    //   this.destinationPath('.eslintignore'),
    //   this.fs.read(this.templatePath('.eslintignore.template')),
    //   this.config.getPath('typescript.outDir') || 'lib',
    // );

    // this.fs.extendJSON(
    //   this.destinationPath('.eslintrc.json'),
    //   this.fs.readJSON(this.templatePath('.eslintrc.json.template')),
    // );

    // this.fs.extendJSON(
    //   this.destinationPath('tsconfig.eslint.json'),
    //   this.fs.readJSON(this.templatePath('tsconfig.eslint.json.template')),
    // );

    this.fs.extendJSON(this.destinationPath('package.json'), {
      devDependencies: await deps('jest', '@types/jest', 'ts-jest'),
    });
  }
}
