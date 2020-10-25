import { promises as fs } from 'fs';

import * as Generator from 'yeoman-generator';
import { exec } from '../utils';

module.exports = class extends Generator {
  async configuring() {
    if (!this.fs.exists(this.destinationPath('package.json'))) {
      await exec('npm init -y');
      const json = await fs.readFile(this.destinationPath('package.json'));
      await fs.unlink(this.destinationPath('package.json'));

      this.fs.writeJSON(
        this.destinationPath('package.json'),
        JSON.parse(json.toString()),
      );
    }
  }
};
