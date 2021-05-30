import * as Generator from 'yeoman-generator';
import { createState, joinScript, splitScript } from '../utils';

const choices = ['eslint', 'tslint'] as const;
type Choice = typeof choices[number];

export const tslintScript =
  "tslint -c tslint.json -e 'node_modules/**/*' '**/*.ts'";
export const eslintScript = 'eslint src/**/*.ts';
export const eslintFixScript = 'eslint --fix src/**/*.ts';

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
    const { scripts } = this.fs.readJSON(this.destinationPath('package.json'));
    const lint = splitScript(scripts.lint);
    const lintFix = splitScript(scripts['lint:fix']);

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

        if (!lint.includes(eslintScript)) lint.push(eslintScript);
        if (!lintFix.includes(eslintFixScript)) lintFix.push(eslintFixScript);

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

        if (!lint.includes(tslintScript)) lint.push(tslintScript);

        break;
      }
    }

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        lint: joinScript(lint),
        'lint:fix': joinScript(lintFix),
      },
    });
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
