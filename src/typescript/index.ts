import { types } from 'util';
import * as Generator from 'yeoman-generator';
import { createState } from '../utils';
import { getTypescriptVersions } from './network';

module.exports = class extends Generator {
  constructor(args: ['latest'], opts) {
    super(args, opts);

    this.tag = args[0];
  }
  private state = createState();

  private tag: string;

  async prompting() {
    try {
      this.tag ||=
        this.state.typescript ||
        (
          await this.prompt([
            {
              type: 'list',
              name: 'typescript',
              message: 'Select Typescript version',
              choices: (await getTypescriptVersions()).map(
                ({ tag, version }) => ({
                  name: `${tag} (${version})`,
                  value: tag,
                }),
              ),
              default: 0,
            },
          ])
        ).typescript;
    } catch (err) {
      if (types.isNativeError(err)) {
        this.log(err.message);
        this.log('Using typescript@latest');
        this.state.typescript = 'latest';
      } else {
        throw err;
      }
    }
  }

  configuring() {
    this.fs.copy(
      this.templatePath('tsconfig.json.template'),
      this.destinationPath('tsconfig.json'),
    );

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        start: 'node ./lib/index.js',
        prebuild: 'npm run lint && rm -rf lib/*',
        build: 'tsc',
      },
    });
  }

  install() {
    this.npmInstall([`typescript@${this.tag}`, '@types/node'], {
      'save-dev': true,
    });
  }
};
