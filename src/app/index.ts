import * as Generator from 'yeoman-generator';
import { join } from 'path';

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('vscode', {
      type: Boolean,
      default: false,
      description: 'Adds launch configurations for Visual Studio Code',
    });
  }

  private answers: Record<string, any>;

  private readonly code = {
    examples: 'Example code and tests',
    blank: 'Empty project only',
  };

  private readonly testLib = {
    jest: 'Jest',
    mocha: 'Mocha/Chai',
  };

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
        name: 'code',
        message: 'Examples',
        choices: [this.code.examples, this.code.blank],
        default: 0,
      },
      {
        type: 'rawlist',
        name: 'testLib',
        message: 'Select a test library?',
        choices: [this.testLib.jest, this.testLib.mocha],
        default: 0,
      },
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

    let testScript = 'echo "Error: no test specified" && exit 1';
    if (this.answers['testLib'] === this.testLib.jest) {
      testScript = 'jest';
      ['jest.config.json'].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    } else if (this.answers['testLib'] === this.testLib.mocha) {
      testScript =
        "NODE_ENV=test nyc mocha --require source-map-support/register --require ts-node/register --recursive './src/**/*.tests.ts'";
    }

    ['package.json', 'README.md'].forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file + '.template'),
        this.destinationPath(file),
        {
          badges,
          testScript,
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
    if (this.answers['code'] === this.code.examples) {
      if (this.answers['testLib'] === this.testLib.jest) {
        [join('src', 'index.tests.ts')].forEach(file => {
          this.fs.copy(
            this.templatePath(file + '.jest.template'),
            this.destinationPath(file),
          );
        });
      } else if (this.answers['testLib'] === this.testLib.mocha) {
        [join('src', 'index.tests.ts')].forEach(file => {
          this.fs.copy(
            this.templatePath(file + '.mocha.template'),
            this.destinationPath(file),
          );
        });
      }

      [join('src', 'index.ts')].forEach(file => {
        this.fs.copy(
          this.templatePath(file + '.template'),
          this.destinationPath(file),
        );
      });
    }
  }

  install() {
    const all = ['typescript@4', '@types/node', 'prettier', 'tslint'];

    let packages = [...all];

    if (this.answers['testLib'] === this.testLib.jest) {
      packages = [...all, 'jest', '@types/jest', 'ts-jest'];
    } else if (this.answers['testLib'] === this.testLib.mocha) {
      packages = [
        ...all,
        'mocha',
        '@types/mocha',
        'chai',
        '@types/chai',
        'nyc',
        'ts-node',
        'source-map-support',
      ];
    }

    this.npmInstall(packages, { 'save-dev': true });
  }

  private pkg: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
  };
};
