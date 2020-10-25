import { getJson } from '../utils';

type NodeVersions = {
  [version: string]: {
    start: string;
    end: string;
  };
};

type NodeDist = {
  version: string;
}[];

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
