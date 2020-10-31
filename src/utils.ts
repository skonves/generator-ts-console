import * as childProcess from 'child_process';
import * as https from 'https';

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
