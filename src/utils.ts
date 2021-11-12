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

export function append(
  fs: Generator.MemFsEditor,
  filepath: string,
  contents: string,
  separator: string = EOL,
): void {
  const original = fs.exists(filepath) ? fs.read(filepath) : '';
  fs.write(filepath, [original, contents].filter((x) => x).join(separator));
}

export function filterDev(pkg: any, dependencies: string[]): string[] {
  if (!pkg?.dependencies) return dependencies;
  const dependencySet = new Set(dependencies);

  for (const existing of Object.keys(pkg.dependencies)) {
    dependencySet.delete(existing);
  }

  return Array.from(dependencySet);
}

export function ignore(
  fs: Generator.MemFsEditor,
  filepath: string,
  content: string,
): void {
  const original = fs.exists(filepath) ? fs.read(filepath) : '';
  const lines = (content || '')
    .split(EOL)
    .map((line) => line.split('#')[0].trim())
    .filter((x) => x);

  const newLines = new Set<string>();

  for (const line of lines) {
    if (!ignores(original, line)) {
      newLines.add(line);
    }
  }

  newLines.delete('');
  newLines.add('');

  append(fs, filepath, Array.from(newLines).join(EOL));
}

export function ignores(ignoreFile: string, item: string): boolean {
  return ignoreFile
    .split(EOL)
    .map((line) => line.split('#')[0].trim())
    .some((x) => x === item);
}

export function mergeArray(
  original: string[] | undefined,
  incomming: string[] | undefined,
): string[] {
  if (!original?.length) return incomming || [];
  if (!incomming?.length) return original || [];

  const incommingSet = new Set(incomming);

  for (const originalValue of original) {
    incommingSet.delete(originalValue);
  }

  return incommingSet.size
    ? [...original, ...Array.from(incommingSet)]
    : original;
}
