import * as Generator from 'yeoman-generator';

const choices = ['tslint'] as const;
type Choice = (typeof choices)[number];

export const tslintScript =
  "tslint -c tslint.json -e 'node_modules/**/*' '**/*.ts'";

module.exports = class extends Generator {
  constructor(args: [Choice], opts) {
    super(args, opts);

    this.answer = args[0];
  }

  private answer: Choice;

  async prompting() {
    this.answer =
      this.answer ||
      (await this.prompt([
        {
          type: 'list',
          name: 'linter',
          message: 'Select linter',
          choices: [{ name: 'TSLint', value: 'tslint' }],
          default: 0,
        },
      ])).linter;
  }

  configuring() {
    switch (this.answer) {
      case 'tslint': {
        this.fs.copy(
          this.templatePath('tslint.json.template'),
          this.destinationPath('tslint.json'),
        );

        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: { lint: tslintScript },
        });

        break;
      }
    }
  }

  installing() {
    switch (this.answer) {
      case 'tslint': {
        this.npmInstall(['tslint'], {
          'save-dev': true,
        });
        break;
      }
    }
  }
};

module.exports.tslintScript = tslintScript;
