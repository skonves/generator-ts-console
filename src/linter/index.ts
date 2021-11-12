import * as Generator from 'yeoman-generator';
import { createState, filterDev, ignore } from '../utils';

const choices = ['eslint', 'tslint'] as const;
type Choice = typeof choices[number];

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
        const tsconfig = this.fs.readJSON(
          this.destinationPath('tsconfig.json'),
        );
        const outDir = tsconfig?.compilerOptions?.outDir;
        ignore(
          this.fs,
          this.destinationPath('.eslintignore'),
          this.fs.read(this.templatePath('.eslintignore.template')),
        );
        ignore(this.fs, this.destinationPath('.eslintignore'), outDir);
        this.fs.extendJSON(
          this.destinationPath('.eslintrc.json'),
          this.fs.readJSON(this.templatePath('.eslintrc.json.template')),
        );
        this.fs.extendJSON(
          this.destinationPath('tsconfig.eslint.json'),
          this.fs.readJSON(this.templatePath('tsconfig.eslint.json.template')),
        );

        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: {
            'lint:eslint': 'eslint src/**/*.*',
            'fix:eslint': 'eslint --fix src/**/*.*',
          },
        });

        break;
      }
      case 'tslint': {
        this.fs.extendJSON(
          this.destinationPath('tslint.json'),
          this.fs.readJSON(this.templatePath('tslint.json.template')),
        );

        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: {
            'lint:tslint':
              "tslint -c tslint.json -e 'node_modules/**/*' '**/*.ts'",
          },
        });

        break;
      }
    }
  }

  install() {
    switch (this.answer) {
      case 'eslint': {
        this.npmInstall(
          filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
            '@typescript-eslint/eslint-plugin',
            '@typescript-eslint/parser',
            'eslint',
            'eslint-config-prettier',
            'eslint-plugin-import',
          ]),
          {
            'save-dev': true,
          },
        );
        break;
      }
      case 'tslint': {
        this.npmInstall(
          filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
            'tslint',
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
