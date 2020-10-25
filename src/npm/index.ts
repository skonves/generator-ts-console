import { promises as fs } from 'fs';

import * as Generator from 'yeoman-generator';
import { exec } from '../utils';

module.exports = class extends Generator {
  name: string;
  description: string;

  async configuring() {
    let json: any;
    if (this.fs.exists(this.destinationPath('package.json'))) {
      json = this.fs.readJSON(this.destinationPath('package.json'));
    } else {
      await exec('npm init -y');
      json = JSON.parse(
        (await fs.readFile(this.destinationPath('package.json'))).toString(),
      );
      await fs.unlink(this.destinationPath('package.json'));

      json.version = '0.0.1';
      json.description =
        'Base project for creating a console application in Typescript';

      this.fs.writeJSON(this.destinationPath('package.json'), json);
    }

    this.name = json.name;
    this.description = json.description;
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('README.md.template'),
      this.destinationPath('README.md'),
      {
        name: this.name,
        description: this.description,
      },
    );
  }
};
