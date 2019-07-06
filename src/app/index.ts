import * as Generator from 'yeoman-generator';
import { join } from 'path';

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('code', {
      type: Boolean,
      default: true,
      description: 'Adds example code and tests to the project',
    });
    this.option('vscode', {
      type: Boolean,
      default: false,
      description: 'Adds launch configurations for Visual Studio Code',
    });
  }

  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    if (this.pkg && Object.keys(this.pkg).length) {
      console.log('Found existing package.json:');
      console.log(this.pkg);
    }
  }

  writing() {
    [
      // Root
      '.gitignore',
      '.nycrc',
      '.prettierrc',
      'tsconfig.json',
      'tslint.json',
    ].forEach(file => {
      this.fs.copy(
        this.templatePath(file + '.template'),
        this.destinationPath(file),
      );
    });

    if (this.options.vscode) {
      [join('.vscode', 'launch.json')].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    }

    if (this.options.code) {
      [join('src', 'index.tests.ts'), join('src', 'index.ts')].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    }

    ['package.json', 'README.md'].forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file + '.template'),
        this.destinationPath(file),
        {
          name: this.pkg.name || 'typescript-application',
          version: this.pkg.version || '0.0.1',
          description:
            this.pkg.description ||
            'Base project for creating a console application in Typescript',
          author: this.pkg.author || '',
          license: this.pkg.license || 'ISC',
        },
      );
    });
  }

  install() {
    this.npmInstall(
      [
        'typescript@3',
        '@types/node',
        'prettier',
        'tslint',
        'mocha',
        '@types/mocha',
        'chai',
        '@types/chai',
        'nyc',
        'ts-node',
        'source-map-support',
      ],
      { 'save-dev': true },
    );
  }

  private pkg: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
  };
};
