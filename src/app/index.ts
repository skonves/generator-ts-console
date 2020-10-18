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

  private answers: Record<string, any>;

  private readonly ci = {
    github: 'GitHub Action',
    travis: 'Travis CI (travis-ci.org)',
    none: 'none',
  };

  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    if (this.pkg && Object.keys(this.pkg).length) {
      console.log('Found existing package.json:');
      console.log(this.pkg);
    }
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'rawlist',
        name: 'ci',
        message: 'Which CI tooling will you use?',
        choices: [this.ci.github, this.ci.travis, this.ci.none],
        default: 0,
      },
    ]);
  }

  configuring() {
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

    let badges = '';

    if (this.answers['ci'] === this.ci.travis) {
      ['.travis.yml'].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    } else if (this.answers['ci'] === this.ci.github) {
      ['.github/workflows/build.yml'].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });

      badges =
        '![master](https://github.com/{ORG_NAME}/{REPO_NAME}/workflows/build/badge.svg?branch=master&event=push)\n\n';
    }

    ['package.json', 'README.md'].forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file + '.template'),
        this.destinationPath(file),
        {
          badges,
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

  writing() {
    if (this.options.code) {
      [join('src', 'index.tests.ts'), join('src', 'index.ts')].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    }
  }

  install() {
    this.npmInstall(
      [
        'typescript@4',
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
