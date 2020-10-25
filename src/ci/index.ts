import { join } from 'path';

import * as Generator from 'yeoman-generator';
import { getNodeVersions } from './network';

export const choices = ['github', 'travis', 'none'] as const;
type Choice = (typeof choices)[number];

export const githubBadgeRegex = /\[!\[master\]\(https:\/\/github\.com\/[^\/]+\/[^\/]+\/workflows\/build\/badge\.svg\?branch=master&event=push\)\]\(https:\/\/github\.com\/[^\/]+\/[^\/]+\/actions\?query=workflow%3Abuild\+branch%3Amaster\+event%3Apush\)/g;

module.exports = class extends Generator {
  constructor(args: [Choice], opts) {
    super(args, opts);

    this.answer = args[0];
  }

  private answer: Choice;
  private nodeVersions: number[];

  async prompting() {
    this.answer = choices.includes(this.answer)
      ? this.answer
      : (await this.prompt([
          {
            type: 'list',
            name: 'ci',
            message: 'Which CI tooling will you use?',
            choices: [
              { name: 'Github Actions', value: 'github' },
              { name: 'Travis CI (travis-ci.org)', value: 'travis' },
              { name: 'None', value: 'none' },
            ],
            default: 'github',
          },
        ])).ci;

    this.nodeVersions = this.answer === 'none' ? [] : await getNodeVersions();
  }

  writing() {
    switch (this.answer) {
      case 'github': {
        this.fs.copyTpl(
          this.templatePath(join('.github', 'workflows', 'build.yml.template')),
          this.destinationPath(join('.github', 'workflows', 'build.yml')),
          { nodeVersions: JSON.stringify(this.nodeVersions) },
        );

        if (this.fs.exists(this.destinationPath('README.md'))) {
          const readme = this.fs.read(this.destinationPath('README.md'));
          if (!githubBadgeRegex.test(readme)) {
            this.fs.write(
              this.destinationPath('README.md'),
              `[![master](https://github.com/{ORG_NAME}/{REPO_NAME}/workflows/build/badge.svg?branch=master&event=push)](https://github.com/{ORG_NAME}/{REPO_NAME}/actions?query=workflow%3Abuild+branch%3Amaster+event%3Apush)\n${readme}`,
            );
          }
        }
        break;
      }
      case 'travis': {
        this.fs.copyTpl(
          this.templatePath('.travis.yml.template'),
          this.destinationPath('.travis.yml'),
          { nodeVersions: JSON.stringify(this.nodeVersions) },
        );
        break;
      }
    }
  }
};

module.exports.githubBadgeRegex = githubBadgeRegex;
