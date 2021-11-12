import { join } from 'path';

import * as Generator from 'yeoman-generator';
import { createState, filterDev } from '../utils';

const choices = ['jest', 'mocha'] as const;
type Choice = typeof choices[number];

export const jestScript = 'jest';
export const mochaScript =
  "NODE_ENV=test nyc mocha --require source-map-support/register --require ts-node/register --recursive './src/**/*.tests.ts'";

module.exports = class extends Generator {
  constructor(args: [Choice], opts) {
    super(args, opts);

    this.answer = args[0];
  }
  private state = createState();

  private answer: Choice;

  async prompting() {
    const testing = this.answer || this.state.testing;

    this.answer = choices.includes(testing)
      ? testing
      : (
          await this.prompt([
            {
              type: 'list',
              name: 'testing',
              message: 'Select a testing library',
              choices: [
                { name: 'Jest', value: 'jest' },
                { name: 'Mocha/Chai', value: 'mocha' },
              ],
              default: 'jest',
            },
          ])
        ).testing;
  }

  configuring() {
    const config: string[] = [];

    switch (this.answer) {
      case 'jest': {
        config.push('jest.config.json');
        break;
      }
      case 'mocha': {
        config.push('.nycrc');
        break;
      }
    }

    config.forEach((file) => {
      this.fs.extendJSON(
        this.destinationPath(file),
        this.fs.readJSON(this.templatePath(file + '.template')),
      );
    });
  }

  writing() {
    let test = '';

    switch (this.answer) {
      case 'jest': {
        test = jestScript;
        break;
      }
      case 'mocha': {
        test = mochaScript;
        break;
      }
    }

    this.fs.copy(
      this.templatePath(join('src', 'index.ts.template')),
      this.destinationPath(join('src', 'index.ts')),
    );

    this.fs.copy(
      this.templatePath(join('src', `index.tests.ts.${this.answer}.template`)),
      this.destinationPath(join('src', 'index.tests.ts')),
    );

    if (test) {
      this.fs.extendJSON(this.destinationPath('package.json'), {
        scripts: {
          'clean:coverage': 'rimraf coverage',
          pretest: 'run-s -s clean',
          test,
        },
      });
    }
  }

  install() {
    switch (this.answer) {
      case 'jest': {
        this.npmInstall(
          filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
            'jest',
            '@types/jest',
            'ts-jest',
          ]),
          {
            'save-dev': true,
          },
        );
        break;
      }
      case 'mocha': {
        this.npmInstall(
          filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
            'mocha',
            '@types/mocha',
            'chai',
            '@types/chai',
            'nyc',
            'ts-node',
            'source-map-support',
          ]),
          {
            'save-dev': true,
          },
        );
        break;
      }
    }
  }
};

module.exports.jestScript = jestScript;
module.exports.mochaScript = mochaScript;
