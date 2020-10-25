import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import { join } from 'path';

import * as helpers from 'yeoman-test';
import * as rimraf from 'rimraf';

export async function getJson<T = any>(url: string): Promise<T> {
  return JSON.parse(await getText(url));
}

export function getText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data: string = '';

        res.on('data', d => {
          data += d.toString();
        });

        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', e => {
        reject(e);
      });
  });
}

export async function exec(
  command: string,
  options?: childProcess.ExecOptions,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const result = {
      stdout: '',
      stderr: '',
    };

    const proc = childProcess.exec(
      command,
      options || {},
      (err, stdout, stderr) => {
        result.stderr += stderr;
        result.stdout += stdout;
      },
    );

    proc.on('close', () => resolve(result));
    proc.on('disconnect', () => resolve(result));
    proc.on('exit', () => resolve(result));
  });
}

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
      rimraf(this._tempdir, err => (err ? reject(err) : resolve())),
    );
  }

  run() {
    return helpers.run(this.generator).inTmpDir(dir => {
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
