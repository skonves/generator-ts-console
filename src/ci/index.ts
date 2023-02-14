import { join } from 'path';
import * as Generator from 'yeoman-generator';
import { getNodeVersions } from './network';

export const githubBadgeRegex =
  /\[!\[main\]\(https:\/\/github\.com\/[^\/]+\/[^\/]+\/workflows\/build\/badge\.svg\?branch=main&event=push\)\]\(https:\/\/github\.com\/[^\/]+\/[^\/]+\/actions\?query=workflow%3Abuild\+branch%3Amain\+event%3Apush\)/g;

export default class extends Generator {
  async configuring() {
    this.fs.copyTpl(
      this.templatePath(join('.github', 'workflows', 'build.yml.template')),
      this.destinationPath(join('.github', 'workflows', 'build.yml')),
      { nodeVersions: JSON.stringify(await getNodeVersions()) },
    );

    if (this.fs.exists(this.destinationPath('README.md'))) {
      const readme = this.fs.read(this.destinationPath('README.md'));
      if (!githubBadgeRegex.test(readme)) {
        this.fs.write(
          this.destinationPath('README.md'),
          `[![main](https://github.com/{ORG_NAME}/{REPO_NAME}/workflows/build/badge.svg?branch=main&event=push)](https://github.com/{ORG_NAME}/{REPO_NAME}/actions?query=workflow%3Abuild+branch%3Amain+event%3Apush)\n${readme}`,
        );
      }
    }
  }
}
