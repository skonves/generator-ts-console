import * as childProcess from 'child_process';
import * as https from 'https';
import { EOL } from 'os';

import * as Generator from 'yeoman-generator';

export function createState() {
  return new Proxy<any>(
    {},
    {
      get(_, key) {
        try {
          const str = process.env.GENERATOR_STATE || '{}';

          return JSON.parse(str)[key];
        } catch {
          return undefined;
        }
      },
      set(_, key, value) {
        let serializedValue: any;
        switch (typeof value) {
          case 'boolean':
          case 'number':
          case 'string':
          case 'undefined':
            serializedValue = value;
            break;
          case 'object':
            serializedValue = JSON.stringify(value);
            break;
          default:
            throw new Error(`Cannot serialize type ${typeof value}`);
        }

        const existing = JSON.parse(process.env.GENERATOR_STATE || '{}');

        process.env.GENERATOR_STATE = JSON.stringify({
          ...existing,
          [key]: serializedValue,
        });

        return true;
      },
    },
  );
}

export async function getJson<T = any>(url: string): Promise<T> {
  return JSON.parse(await getText(url));
}

export function getText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data: string = '';

        res.on('data', (d) => {
          data += d.toString();
        });

        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (e) => {
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

export function splitScript(script: string | null | undefined): string[] {
  return (script || '').split('&&').map((x) => x.trim());
}

export function joinScript(script: string[]): string {
  return script.filter((x) => x).join(' && ');
}

export function append(
  fs: Generator.MemFsEditor,
  filepath: string,
  contents: string,
  separator: string = EOL,
): void {
  const original = fs.exists(filepath) ? fs.read(filepath) : '';
  fs.write(filepath, [original, contents].filter((x) => x).join(separator));
}
