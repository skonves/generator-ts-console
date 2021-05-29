import * as Generator from 'yeoman-generator';
import { createState } from '../utils';

const choices = ['eslint', 'tslint'] as const;
type Choice = typeof choices[number];

export const tslintScript =
  "tslint -c tslint.json -e 'node_modules/**/*' '**/*.ts'";
export const eslintScript = 'eslint src/**/*.ts';

module.exports = class extends Generator {
  constructor(args: [Choice], opts) {
    super(args, opts);

    this.answer = args[0];
  }
  private state = createState();

  private answer: Choice;

  async prompting() {
    const linter = this.answer || this.state.linter;

    this.answer = choices.includes(linter)
      ? linter
      : (
          await this.prompt([
            {
              type: 'list',
              name: 'linter',
              message: 'Select linter',
              choices: [
                { name: 'ESLint', value: 'eslint' },
                { name: 'TSLint (deprecated)', value: 'tslint' },
              ],
              default: 0,
            },
          ])
        ).linter;
  }

  configuring() {
    switch (this.answer) {
      case 'eslint': {
        this.fs.copy(
          this.templatePath('.eslintignore.template'),
          this.destinationPath('.eslintignore'),
        );
        this.fs.extendJSON(
          this.destinationPath('.eslintrc.json'),
          this.fs.readJSON(this.templatePath('.eslintrc.json.template')),
        );

        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: { lint: eslintScript },
        });

        this.fs.extendJSON(this.destinationPath('tsconfig.json'), {
          exclude: [],
        });

        break;
      }
      case 'tslint': {
        this.fs.extendJSON(
          this.destinationPath('tslint.json'),
          this.fs.readJSON(this.templatePath('tslint.json.template')),
        );

        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: { lint: tslintScript },
        });

        break;
      }
    }
  }

  install() {
    switch (this.answer) {
      case 'eslint': {
        this.npmInstall(
          [
            '@typescript-eslint/eslint-plugin',
            '@typescript-eslint/parser',
            'eslint',
            'eslint-config-prettier',
            'eslint-plugin-import',
          ],
          {
            'save-dev': true,
          },
        );
        break;
      }
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
module.exports.eslintScript = eslintScript;
