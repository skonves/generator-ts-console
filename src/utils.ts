import * as childProcess from 'child_process';
import * as https from 'https';
import { EOL } from 'os';

import { Editor } from 'mem-fs-editor';

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

export function appendIgnore(
  fs: Editor,
  ignorePath: string,
  ...content: string[]
) {
  const original = fs.exists(ignorePath) ? fs.read(ignorePath) : '';

  if (!fs.exists(ignorePath)) fs.write(ignorePath, '');

  const originalLines = new Set(
    original
      .split(EOL)
      .map((line) => line.split('#')[0].trim())
      .filter((x) => x),
  );

  const addLines = new Set(
    (content || [])
      .join(EOL)
      .split(EOL)
      .map((line) => line.split('#')[0].trim())
      .filter((line) => !originalLines.has(line)),
  );

  if (addLines.size) {
    fs.append(ignorePath, Array.from(addLines).join(EOL));
    fs.append(ignorePath, '');
  }
}

export function addScripts(
  fs: Editor,
  packagePath: string,
  scripts: Record<string, string>,
): void {
  const pkg = fs.readJSON(packagePath)?.valueOf();
  if (typeof pkg !== 'object') return;

  const existing: Record<string, string> = pkg['scripts'];

  const final = { ...existing, ...scripts };

  pkg['scripts'] = Object.keys(final)
    .sort(compareScriptNames)
    .reduce(
      (acc, key) => ({ ...acc, [key]: final[key] }),
      {} as Record<string, string>,
    );

  fs.writeJSON(packagePath, pkg);
}

export function compareScriptNames(a: string, b: string): number {
  const aa = parseScriptName(a);
  const bb = parseScriptName(b);

  if (aa.root !== bb.root) return aa.root.localeCompare(bb.root);

  if (aa.prefix === 'pre' || bb.prefix === 'post') return -1;
  if (bb.prefix === 'pre' || aa.prefix === 'post') return 1;

  if (bb.suffix && !aa.suffix) return -1;
  if (aa.suffix && !bb.suffix) return 1;

  return a.localeCompare(b);
}

function parseScriptName(name: string): {
  prefix: 'pre' | 'post' | undefined;
  root: string;
  suffix: string | undefined;
} {
  const [prefixAndRoot, suffix] = name.split(':');

  if (prefixAndRoot.startsWith('pre')) {
    return { prefix: 'pre', root: prefixAndRoot.slice(3), suffix };
  } else if (prefixAndRoot.startsWith('post')) {
    return { prefix: 'post', root: prefixAndRoot.slice(4), suffix };
  } else {
    return { prefix: undefined, root: prefixAndRoot, suffix };
  }
}

export async function deps(
  ...packages: string[]
): Promise<Record<string, string>> {
  const hasVersion = packages.filter((pkg) => pkg.includes('@', 1));
  const needsVersion = packages.filter((pkg) => !pkg.includes('@', 1));

  const versions = await Promise.all(
    needsVersion
      .sort((a, b) => a.localeCompare(b))
      .map<Promise<[string, string]>>(async (pkg) => {
        const latest = await getJson(
          `https://registry.npmjs.com/${pkg}/latest`,
        );
        return [pkg, `^${latest.version}`];
      }),
  );

  const x = hasVersion
    .map<[string, string]>((versionedPkg) => {
      const [pkg, version] = versionedPkg.split('@');
      return [pkg, version];
    })
    .reduce(
      (acc, [pkg, version]) => ({ ...acc, [pkg]: version }),
      {} as Record<string, string>,
    );

  return versions.reduce(
    (acc, [pkg, version]) => ({ ...acc, [pkg]: version }),
    x as Record<string, string>,
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
