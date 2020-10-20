import * as https from 'https';

type NpmManifest = {
  'dist-tags': { [tag: string]: string };
};

type NodeVersions = {
  [version: string]: {
    start: string;
    end: string;
  };
};

type NodeDist = {
  version: string;
}[];

export async function getTypescriptVersions(): Promise<
  {
    version: string;
    tag: string;
  }[]
> {
  const { 'dist-tags': tags } = await getJson<NpmManifest>(
    'https://registry.npmjs.com/typescript',
  );

  return Object.keys(tags).map(tag => ({ version: tags[tag], tag }));
}

/**
 * Gets an array of major versions that are active per the schedule
 * and available for download.
 */
export async function getNodeVersions(): Promise<number[]> {
  const [schedule, dist] = await Promise.all([
    getJson<NodeVersions>(
      'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
    ),
    getJson<NodeDist>('https://nodejs.org/dist/index.json'),
  ]);

  const versionNames = Object.keys(schedule);

  const now = new Date();

  return versionNames
    .filter(versionName =>
      dist.some(v => v.version.startsWith(`${versionName}.`)),
    )
    .filter(versionName => {
      const version = schedule[versionName];

      const start = new Date(version.start);
      const end = new Date(version.end);

      return start < now && now < end;
    })
    .map(versionName => Number(versionName.substr(1)));
}

function getJson<T = any>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data: string = '';

        res.on('data', d => {
          data += d.toString();
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      })
      .on('error', e => {
        reject(e);
      });
  });
}
