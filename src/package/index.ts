import * as fs from 'node:fs/promises';

import { title } from 'case';
import Generator = require('yeoman-generator');
import { addScripts, deps, exec } from '../utils';

export default class extends Generator {
  constructor(args: string | string[], options: any) {
    super(args, options);
  }

  async configuring() {
    const { pkg, existing } = await this._getPackageJson();

    if (!existing) pkg.version = '0.0.1';
    pkg.description ||= 'Empty Typescript project';

    this.config.setPath('package.name', pkg.name);
    this.config.setPath('package.version', pkg.version);
    this.config.setPath('package.description', pkg.description);

    const { name, version, description, ...rest } = pkg;

    this.fs.writeJSON(this.destinationPath('package.json'), {
      name,
      version,
      description,
      ...rest,
    });

    addScripts(this.fs, this.destinationPath('package.json'), {
      clean: 'run-s -s clean:*',
      lint: 'run-s -s lint:*',
      fix: 'run-s -s fix:*',
    });

    this.fs.extendJSON(this.destinationPath('package.json'), {
      devDependencies: await deps('rimraf', 'npm-run-all'),
    });
  }

  async writing() {
    this.fs.copyTpl(
      this.templatePath('README.md.template'),
      this.destinationPath('README.md'),
      {
        name: title(this.config.getPath('package.name')),
        description: this.config.getPath('package.description'),
      },
    );
  }

  async _getPackageJson(): Promise<{ pkg: any; existing: boolean }> {
    if (this.fs.exists(this.destinationPath('package.json'))) {
      return {
        pkg: this.fs.readJSON(this.destinationPath('package.json'))?.valueOf(),
        existing: true,
      };
    } else {
      await exec('npm init -y');
      const pkg = JSON.parse(
        (await fs.readFile(this.destinationPath('package.json'))).toString(),
      );
      await fs.unlink(this.destinationPath('package.json'));

      return { pkg, existing: false };
    }
  }
}
