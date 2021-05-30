import * as childProcess from 'child_process';
import * as https from 'https';

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
