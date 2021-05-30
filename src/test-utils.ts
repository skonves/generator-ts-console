import * as fs from 'fs';
import { join } from 'path';

import * as helpers from 'yeoman-test';
import * as rimraf from 'rimraf';

export class TestContext {
  constructor(private readonly generator: string) {}

  private _tempdir: string;

  private _files: Map<string, string>;

  get tempdir(): string {
    return this._tempdir;
  }

  async setup(): Promise<void> {
    this._files = new Map();
  }

  teardown(): Promise<void> {
    return new Promise((resolve, reject) =>
      rimraf(this._tempdir, (err) => (err ? reject(err) : resolve())),
    );
  }

  run() {
    return helpers.run(this.generator).inTmpDir((dir) => {
      this._tempdir = dir;
      for (const path of this._files.keys()) {
        fs.writeFileSync(this.join(path), this._files.get(path));
      }
    });
  }

  withFile(path: string, content: string): void {
    this._files.set(path, content);
  }

  join(...paths: string[]): string {
    return join(this._tempdir, ...paths);
  }
}
