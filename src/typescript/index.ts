import { join } from 'path';
import { types } from 'util';
import * as Generator from 'yeoman-generator';
import { addScripts, deps, mergeArray } from '../utils';
import { getTypescriptVersions } from './network';

export default class extends Generator {
  typescriptVersions: {
    version: string;
    tag: string;
  }[];
  async prompting() {
    this.typescriptVersions = await getTypescriptVersions();
    try {
      const distTag = (
        await this.prompt([
          {
            type: 'list',
            name: 'typescript',
            message: 'Select Typescript version',
            choices: this.typescriptVersions.map(({ tag, version }) => ({
              name: `${tag} (${version})`,
              value: version,
            })),
            default: 0,
          },
        ])
      ).typescript;

      this.config.setPath('typescript.version', distTag);
    } catch (err) {
      if (types.isNativeError(err)) {
        this.log(err.message);
        this.log('Using typescript@latest');
        this.config.setPath('typescript.version', 'latest');
      } else {
        throw err;
      }
    }
  }

  async configuring() {
    const tsconfig = this.fs
      .readJSON(this.destinationPath('tsconfig.json'))
      ?.valueOf() as any;
    const tsconfigTemplate = this.fs
      .readJSON(this.templatePath('tsconfig.json.template'))
      ?.valueOf() as any;

    const outDir: string =
      tsconfig?.compilerOptions?.outDir ||
      tsconfigTemplate?.compilerOptions?.outDir ||
      'lib';
    this.config.setPath('typescript.outDir', outDir);

    const include = mergeArray(tsconfig?.include, tsconfigTemplate?.include);
    const exclude = mergeArray(tsconfig?.exclude, tsconfigTemplate?.exclude);

    this.fs.extendJSON(this.destinationPath('tsconfig.json'), tsconfigTemplate);

    this.fs.extendJSON(this.destinationPath('tsconfig.json'), {
      compilerOptions: { outDir },
      include,
      exclude,
    });

    addScripts(this.fs, this.destinationPath('package.json'), {
      'clean:output': `rimraf ${outDir}`,
      start: `node ./${outDir}/index.js`,
      prebuild: 'run-s -s clean lint',
      build: 'tsc',
    });

    this.fs.extendJSON(this.destinationPath('package.json'), {
      main: `./${outDir}/index.js`,
      files: [outDir],
    });

    this.fs.extendJSON(this.destinationPath('package.json'), {
      devDependencies: await deps(
        `typescript@^${this.config.getPath('typescript.version')}`,
      ),
    });
  }

  async writing() {
    this.fs.copyTpl(
      this.templatePath(join('src', 'index.ts.template')),
      this.destinationPath(join('src', 'index.ts')),
      { packageName: this.config.getPath('package.name') },
    );
  }
}
