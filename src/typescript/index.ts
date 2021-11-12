import { types } from 'util';
import * as Generator from 'yeoman-generator';
import { createState, filterDev, ignore, mergeArray } from '../utils';
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
              choices: (
                await getTypescriptVersions()
              ).map(({ tag, version }) => ({
                name: `${tag} (${version})`,
                value: tag,
              })),
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
    const tsconfig = this.fs.readJSON(this.destinationPath('tsconfig.json'));
    const tsconfigTemplate = this.fs.readJSON(
      this.templatePath('tsconfig.json.template'),
    );
    const outDir =
      tsconfig?.compilerOptions?.outDir ||
      tsconfigTemplate?.compilerOptions?.outDir;

    const include = mergeArray(tsconfig?.include, tsconfigTemplate?.include);
    const exclude = mergeArray(tsconfig?.exclude, tsconfigTemplate?.exclude);

    this.fs.extendJSON(this.destinationPath('tsconfig.json'), tsconfigTemplate);

    this.fs.extendJSON(this.destinationPath('tsconfig.json'), {
      compilerOptions: { outDir },
      include,
      exclude,
    });

    this.fs.extendJSON(this.destinationPath('package.json'), {
      main: `./${outDir}/index.js`,
      files: [outDir],
    });

    ignore(this.fs, this.destinationPath('.gitignore'), `${outDir}/`);

    this.fs.extendJSON(this.destinationPath('package.json'), {
      scripts: {
        'clean:output': `rimraf ${outDir}`,
        start: `node ./${outDir}/index.js`,
        prebuild: 'run-s -s clean lint',
        build: 'tsc',
      },
    });
  }

  install() {
    this.npmInstall(
      filterDev(this.fs.readJSON(this.destinationPath('package.json')), [
        `typescript@${this.tag}`,
        '@types/node',
      ]),
      {
        'save-dev': true,
      },
    );
  }
};
